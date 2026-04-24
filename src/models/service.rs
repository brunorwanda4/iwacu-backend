use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// ServiceDepartment struct representing a row in the service_departments table
/// Maps to all columns from the service_departments table
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ServiceDepartment {
    pub id: Uuid,
    pub name: String,
    pub name_kinyarwanda: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub phone_number: Option<String>,
    pub email: Option<String>,
    pub website_url: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

/// ServiceDepartmentPublic struct for API responses
/// Excludes phone_number and email for privacy
#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceDepartmentPublic {
    pub id: Uuid,
    pub name: String,
    pub name_kinyarwanda: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub website_url: Option<String>,
    pub is_active: bool,
}

impl From<ServiceDepartment> for ServiceDepartmentPublic {
    fn from(dept: ServiceDepartment) -> Self {
        ServiceDepartmentPublic {
            id: dept.id,
            name: dept.name,
            name_kinyarwanda: dept.name_kinyarwanda,
            description: dept.description,
            category: dept.category,
            website_url: dept.website_url,
            is_active: dept.is_active,
        }
    }
}

/// ServiceRequest struct representing a row in the service_requests table
/// Maps to all columns from the service_requests table
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ServiceRequest {
    pub id: Uuid,
    pub citizen_id: Uuid,
    pub department_id: Uuid,
    pub subject: String,
    pub body: String,
    pub status: String,
    pub priority: String,
    pub reference_number: String,
    pub response_text: Option<String>,
    pub responded_at: Option<DateTime<Utc>>,
    pub location_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// ServiceRequestPublic struct for API responses
/// Excludes body for brevity in list responses
#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceRequestPublic {
    pub id: Uuid,
    pub citizen_id: Uuid,
    pub department_id: Uuid,
    pub subject: String,
    pub status: String,
    pub priority: String,
    pub reference_number: String,
    pub response_text: Option<String>,
    pub responded_at: Option<DateTime<Utc>>,
    pub location_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<ServiceRequest> for ServiceRequestPublic {
    fn from(request: ServiceRequest) -> Self {
        ServiceRequestPublic {
            id: request.id,
            citizen_id: request.citizen_id,
            department_id: request.department_id,
            subject: request.subject,
            status: request.status,
            priority: request.priority,
            reference_number: request.reference_number,
            response_text: request.response_text,
            responded_at: request.responded_at,
            location_id: request.location_id,
            created_at: request.created_at,
            updated_at: request.updated_at,
        }
    }
}
