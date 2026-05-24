package com.kydira_api.repository;

import com.kydira_api.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    // Trae todos los quizzes de un documento específico
    List<Quiz> findByDocumentId_DocumentId(Integer documentId);

    // Trae todos los quizzes de un usuario navegando: quiz → document → user
    // Reemplaza lo que antes hacía quiz.user_id directamente
    // Spring Data genera: JOIN documents ON quiz.document_id = documents.document_id
    //                     JOIN users    ON documents.user_id  = users.user_id
    //                     WHERE users.user_id = :userId
    List<Quiz> findByDocumentId_UserId_UserId(Long userId);
}