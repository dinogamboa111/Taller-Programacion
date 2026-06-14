package com.kydira_api.service;

import java.util.Map;

public interface ISummaryService {
    Map<String, String> getSummaryByDocument(Integer documentId);
    void deleteSummaryByDocument(Integer documentId);
    Map<String, String> generateSummary(Integer documentId) throws Exception;
}
