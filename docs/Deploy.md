# Guía de Despliegue con GitHub Actions (Google Cloud & Nginx)

---

## 1. Arquitectura de Despliegue

El despliegue está diseñado bajo un modelo híbrido basado en un servidor web Nginx como proxy inverso en el host:

```
                  [ Petición del Cliente (HTTPS) ]
                                 │
                                 ▼
                     [ Internet (DNS Dominio) ]
                                 │
                                 ▼
┌──────────────────────── VM Google Cloud (Debian) ────────────────────────┐
│                                                                          │
│  [ Servidor Nginx (Host) ]                                               │
│    ├── Puerto 443 (SSL via Certbot)                                      │
│    ├── optica.proyectosbox.com ──► Proxy a 127.0.0.1:4173 (Admin)        │
│    └── catalogo.optica.proyectosbox.com ──► Proxy a 127.0.0.1:4174 (B2C) │
│                                                                          │
│  ┌────────────────────── Red Docker (Docker Compose) ─────────────────┐  │
│  │                                                                    │  │
│  │  [ optica_admin_prod ] (Puerto 4173:80)                            │  │
│  │    └── Nginx Interno ──► /api/* a http://backend:8080/api/*        │  │
│  │                                                                    │  │
│  │  [ optica_catalogo_prod ] (Puerto 4174:80)                          │  │
│  │    └── Nginx Interno ──► /api/* a http://backend:8080/api/*        │  │
│  │                                                                    │  │
│  │  [ optica_backend_prod ] (Puerto 127.0.0.1:8080:8080)              │  │
│  │    └── Aplicación Spring Boot (API)                                │  │
│  │                                                                    │  │
│  │  [ optica_db_prod ] (Puerto 3306 cerrado al exterior)              │  │
│  │    └── Base de Datos MySQL                                         │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Características Principales:
*   **Servidor Host:** Instancia de **Google Cloud Compute Engine** corriendo **Debian**.
*   **Gestión de Redirección Interna:** Los contenedores frontend (`admin` y `catalogo`) contienen un Nginx interno que redirige dinámicamente las llamadas a `/api/` hacia el contenedor `backend:8080`.
*   **Seguridad:** La base de datos MySQL (`optica_db_prod`) y el backend (`optica_backend_prod`) no exponen sus puertos al exterior de la VM, garantizando que todo el tráfico pase obligatoriamente a través del Nginx del host y el proxy reverso del contenedor.

---

## 2. Flujo de Trabajo del Pipeline (GitHub Actions)

El workflow de despliegue se define en el archivo [.github/workflows/deploy-vm.yml](file:///.github/workflows/deploy-vm.yml).

### Eventos de Disparo
1.  **Push a la rama `main`:** Despliegue automatizado tras finalizar un ciclo de release (ver guía de [Release.md](file:///docs/Release.md)).
2.  **Workflow Dispatch (Manual):** Permite ejecutar manualmente el despliegue desde la interfaz de GitHub Actions, pudiendo especificar cualquier rama u referencia de Git para desplegar.

### Pasos ejecutados por el Pipeline:
1.  **Validar Secretos:** Asegura que todas las credenciales requeridas de SSH estén definidas en GitHub.
2.  **Iniciar Agente SSH:** Configura `ssh-agent`, registra la llave privada (`DEPLOY_SSH_KEY`) y configura la variable de entorno para la sesión.
3.  **Configurar `known_hosts`:** Agrega la clave pública del servidor (`DEPLOY_KNOWN_HOSTS`) para evitar prompts interactivos de SSH.
4.  **Ejecutar comandos en la VM remota:**
    *   Entra al directorio del proyecto (`DEPLOY_PATH`).
    *   Actualiza el historial de Git (`git fetch --all --prune`).
    *   Realiza Checkout de la referencia seleccionada (`git checkout`).
    *   Realiza un Pull rápido (`git pull --ff-only`).
    *   Reconstruye y levanta el stack tecnológico (`docker compose --env-file .env up -d --build`).
    *   Limpia imágenes de docker huérfanas o en desuso (`docker image prune -f`).

---

## 3. Preparación del Servidor (Debian)

Antes de ejecutar el pipeline por primera vez, el servidor de Google Cloud debe ser configurado con los siguientes requisitos previos.

### 3.1. Instalar dependencias del Host
Actualiza el sistema e instala Docker, Docker Compose, Nginx y Certbot:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Instalar Docker
sudo curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER # Añade tu usuario al grupo docker (requiere reiniciar sesión)
```

### 3.2. Configurar el Directorio del Proyecto
Crea el directorio de despliegue y otorga permisos al usuario SSH que utilizará GitHub Actions:
```bash
sudo mkdir -p /var/www/optica_Herramientas
sudo chown -R $USER:$USER /var/www/optica_Herramientas
```
Clona el repositorio en ese directorio:
```bash
git clone https://github.com/Proyectos-UTP2000/optica_Herramientas.git /var/www/optica_Herramientas
```

### 3.3. Configurar el archivo de Variables de Entorno (`.env`)
Las variables de entorno de producción **se administran y actualizan manualmente** directamente en la máquina virtual por razones de seguridad.

Crea el archivo `.env` en la raíz del proyecto en la VM:
```bash
cd /var/www/optica_Herramientas
cp .env.example .env
nano .env
```
Asegúrate de llenar las variables críticas con la configuración de producción real (puedes basarte en [.env.prod](file:///.env.prod)):
*   `SPRING_PROFILES_ACTIVE=prod`
*   `FRONTEND_URL=https://optica.proyectosbox.com`
*   `CATALOGO_URL=https://catalogo.optica.proyectosbox.com`
*   Credenciales seguras para `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `JWT_SECRET`, `CLOUDINARY_API_SECRET`, etc.

---

## 4. Configuración de Nginx y SSL en el Servidor

Nginx se encarga de recibir el tráfico HTTPS en el puerto 443, descifrar el SSL, y redirigir las peticiones internamente a los contenedores correspondientes expuestos por Docker Compose.

### 4.1. Crear archivo de Configuración
Crea el archivo de configuración en `/etc/nginx/sites-available/proyectosbox.com` con el siguiente contenido (reemplaza las rutas del certificado con las tuyas una vez generado con Certbot):

```nginx
server {
    server_name optica.proyectosbox.com;
    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:4173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/optica.proyectosbox.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/optica.proyectosbox.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    server_name catalogo.optica.proyectosbox.com;
    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:4174;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/optica.proyectosbox.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/optica.proyectosbox.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = optica.proyectosbox.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name optica.proyectosbox.com;
    return 404; # managed by Certbot
}

server {
    if ($host = catalogo.optica.proyectosbox.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name catalogo.optica.proyectosbox.com;
    return 404; # managed by Certbot
}
```

### 4.2. Habilitar el sitio y verificar Nginx
Habilita el sitio creando un enlace simbólico e inicializa/reinicia Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/proyectosbox.com /etc/nginx/sites-enabled/
sudo nginx -t # Valida que la sintaxis sea correcta
sudo systemctl restart nginx
```

### 4.3. Obtención del certificado SSL (Certbot)
Para configurar SSL automáticamente con Let's Encrypt para ambos subdominios, ejecuta:
```bash
sudo certbot --nginx -d optica.proyectosbox.com -d catalogo.optica.proyectosbox.com
```
Sigue los pasos interactivos. Certbot actualizará automáticamente el archivo de configuración con los bloques SSL y redirecciones de HTTP a HTTPS indicados en la sección 4.1.

---

## 5. Configuración de Secretos en GitHub

Para que GitHub Actions pueda conectarse de forma segura a la VM mediante SSH y ejecutar las tareas de despliegue, debes configurar las siguientes variables en **Settings -> Secrets and variables -> Actions -> Repository secrets** en tu repositorio de GitHub:

### Paso 1: Generar la Llave SSH en tu PC o Servidor
Genera un par de llaves SSH dedicadas únicamente para este flujo de despliegue (no uses contraseñas):
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f id_github_deploy
```

### Paso 2: Autorizar la Llave en la VM de GCP
Copia el contenido del archivo público generado (`id_github_deploy.pub`) y agrégalo en el archivo `authorized_keys` del usuario de despliegue en la VM:
```bash
nano ~/.ssh/authorized_keys
# Pega la llave pública al final y guarda el archivo
```
Asegúrate de que los permisos de seguridad de SSH sean los correctos en la VM:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Paso 3: Registrar los Secretos en GitHub
Crea los siguientes secretos en el repositorio:

| Clave del Secreto | Descripción / Contenido | Ejemplo |
| :--- | :--- | :--- |
| **`DEPLOY_HOST`** | IP pública externa de la VM en Google Cloud o su dominio. | `34.120.45.67` o `proyectosbox.com` |
| **`DEPLOY_USER`** | Nombre de usuario SSH en la VM de Debian con permisos de Docker. | `debian` o tu usuario SSH |
| **`DEPLOY_PORT`** | Puerto SSH del servidor (usualmente es el `22`). | `22` |
| **`DEPLOY_PATH`** | Ruta absoluta de la carpeta del proyecto en la VM. | `/var/www/optica_Herramientas` |
| **`DEPLOY_SSH_KEY`** | Contenido completo de la llave **privada** generada (`id_github_deploy`). | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| **`DEPLOY_KNOWN_HOSTS`** | Firma de host SSH del servidor para evitar la verificación interactiva. | Ver paso 4 |

### Paso 4: Obtener el valor para `DEPLOY_KNOWN_HOSTS`
Para evitar que GitHub Actions falle indicando que la llave del host es desconocida, ejecuta el siguiente comando en tu terminal reemplazando `TU_IP_O_DOMINIO` por los datos reales de la VM, y copia el resultado completo como valor de `DEPLOY_KNOWN_HOSTS`:
```bash
ssh-keyscan -p 22 TU_IP_O_DOMINIO
```

---

## 6. Ejecución del Despliegue

### Despliegue Automático
Una vez configurado todo el entorno:
1. Sigue el flujo detallado en [Release.md](file:///docs/Release.md) para preparar un release estable.
2. Al fusionar la rama de release a `main` y hacer `git push origin main`, se disparará automáticamente el pipeline.
3. Puedes ver el progreso en tiempo real dentro de la pestaña **Actions** del repositorio de GitHub.

### Despliegue Manual
1. Ve a la pestaña **Actions** en GitHub.
2. Selecciona el flujo **Deploy to VM** en la barra lateral izquierda.
3. Haz clic en el botón desplegable **Run workflow**.
4. Selecciona la rama o tag que deseas desplegar (por defecto `main`).
5. Presiona **Run workflow** para iniciar el despliegue manual.
