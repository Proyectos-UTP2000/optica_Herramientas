package com.herramientas.optica.modules.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DniResponse;
import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.RucResponse;

@Service
public class DNI_RUC_Service {
    @Value("${api.peru.url-dni}")
    private String urlDni;

    @Value("${api.peru.url-ruc}")
    private String urlRuc;

    @Value("${api.peru.token}")
    private String token;

    private final RestTemplate restTemplate;

    public DNI_RUC_Service() {
        this.restTemplate = new RestTemplate();
    }

    public DniResponse consultarDni(String dni) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<DniResponse> response = restTemplate.exchange(
                urlDni + dni, HttpMethod.GET, entity, DniResponse.class);
        return response.getBody();
    }

    public RucResponse consultarRuc(String ruc) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<RucResponse> response = restTemplate.exchange(
                urlRuc + ruc, HttpMethod.GET, entity, RucResponse.class);
        return response.getBody();
    }
}
