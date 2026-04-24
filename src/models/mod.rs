// Models module - re-exports all database models
// This module contains all Rust structs that map to database tables
// and provide serialization/deserialization for API responses.

pub mod location;
pub mod citizen;
pub mod session;
pub mod leader;
pub mod announcement;
pub mod service;
pub mod visitor;

// Re-export models
pub use location::{Location, LocationPublic};
pub use citizen::{Citizen, CitizenPublic};
pub use session::{Session, SessionPublic};
pub use leader::{Leader, LeaderPublic};
pub use announcement::{Announcement, AnnouncementPublic, AnnouncementSummary};
pub use service::{ServiceDepartment, ServiceDepartmentPublic, ServiceRequest, ServiceRequestPublic};
pub use visitor::{VisitorRegistration, VisitorRegistrationPublic};
