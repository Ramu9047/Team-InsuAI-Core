package com.insurai.repository;

import com.insurai.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserId(Long userId);

    List<Document> findByStatus(String status);
}
