package com.kydira_api.repository;

import com.kydira_api.model.FileType;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileTypeRepository extends JpaRepository<FileType, Integer> {

    Optional<FileType> findByTypeName(String typeName);
}
