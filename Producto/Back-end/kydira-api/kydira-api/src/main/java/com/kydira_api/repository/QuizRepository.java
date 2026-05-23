package com.kydira_api.repository;

import com.kydira_api.model.Quiz;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    List<Quiz> findByDocumentId_DocumentId(Integer documentId);
}
