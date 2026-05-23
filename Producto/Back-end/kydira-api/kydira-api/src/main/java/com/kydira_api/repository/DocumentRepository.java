package com.kydira_api.repository;

import com.kydira_api.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findByUserId_UserId(Long userId);
}