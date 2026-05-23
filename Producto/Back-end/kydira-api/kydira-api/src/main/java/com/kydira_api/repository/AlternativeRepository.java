package com.kydira_api.repository;

import com.kydira_api.model.Alternative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlternativeRepository extends JpaRepository<Alternative, Integer> {
}
