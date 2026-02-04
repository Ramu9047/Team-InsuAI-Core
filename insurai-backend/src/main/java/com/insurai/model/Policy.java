package com.insurai.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Policy {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;
  private String category; // Personal, Business, etc.
  private String type; // Health, Life, Car, Corporate
  private String description;
  private Double premium; // Monthly cost
  private Double coverage; // Total coverage amount
  private String documentUrl; // Policy doc link

  // Transparency Features
  private Double claimSettlementRatio; // e.g. 98.5

  @jakarta.persistence.ElementCollection
  private java.util.List<String> exclusions = new java.util.ArrayList<>();

  // "What people miss" / Hidden Clauses
  @jakarta.persistence.ElementCollection
  private java.util.List<String> warnings = new java.util.ArrayList<>();

  public Double getClaimSettlementRatio() {
    return claimSettlementRatio;
  }

  public void setClaimSettlementRatio(Double csr) {
    this.claimSettlementRatio = csr;
  }

  public java.util.List<String> getExclusions() {
    return exclusions;
  }

  public void setExclusions(java.util.List<String> exclusions) {
    this.exclusions = exclusions;
  }

  public java.util.List<String> getWarnings() {
    return warnings;
  }

  public void setWarnings(java.util.List<String> warnings) {
    this.warnings = warnings;
  }

  public String getDocumentUrl() {
    return documentUrl;
  }

  public void setDocumentUrl(String documentUrl) {
    this.documentUrl = documentUrl;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Double getPremium() {
    return premium;
  }

  public void setPremium(Double premium) {
    this.premium = premium;
  }

  public Double getCoverage() {
    return coverage;
  }

  public void setCoverage(Double coverage) {
    this.coverage = coverage;
  }
}
