package com.kydira_api.repository;

import com.kydira_api.model.Summary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SummaryRepository extends JpaRepository<Summary, Integer> {
    Optional<Summary> findTopByDocumentId_DocumentIdOrderByGenerationDateDesc(Integer documentId);
    List<Summary> findByDocumentId_DocumentId(Integer documentId);
    List<Summary> findByDocumentId_UserId_UserId(Long userId);
}
