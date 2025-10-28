-- MedellínBot Database Schema
-- Complete schema for entities, procedures, PQRSD requests, users, and tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Entities table (government organizations)
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website_url VARCHAR(500),
  address TEXT,
  category VARCHAR(100), -- 'municipal', 'utilities', 'security', 'health', 'education'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procedures table (trámites)
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[], -- Array of required documents
  cost DECIMAL(10, 2) DEFAULT 0,
  estimated_time VARCHAR(100), -- e.g., "5-10 días hábiles"
  process_steps TEXT[], -- Array of steps
  online_available BOOLEAN DEFAULT false,
  online_url VARCHAR(500),
  category VARCHAR(100), -- 'civil', 'commercial', 'property', 'taxes', etc.
  keywords TEXT[], -- For search and classification
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PQRSD Requests table
CREATE TABLE IF NOT EXISTS pqrsd_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  entity_id UUID REFERENCES entities(id),
  request_type VARCHAR(50) NOT NULL, -- 'peticion', 'queja', 'reclamo', 'sugerencia', 'denuncia'
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  citizen_name VARCHAR(255) NOT NULL,
  citizen_id VARCHAR(50) NOT NULL,
  citizen_email VARCHAR(255),
  citizen_phone VARCHAR(50),
  citizen_address TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'rejected'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  classification_confidence DECIMAL(3, 2), -- AI confidence score
  response TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot users table
CREATE TABLE IF NOT EXISTS bot_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT UNIQUE NOT NULL,
  telegram_username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone_number VARCHAR(50),
  language_code VARCHAR(10) DEFAULT 'es',
  is_active BOOLEAN DEFAULT true,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table (for tracking multi-step flows)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT NOT NULL,
  conversation_type VARCHAR(50) NOT NULL, -- 'procedure_inquiry', 'pqrsd_creation', 'tracking'
  current_step VARCHAR(100),
  context JSONB, -- Store conversation state
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social programs table
CREATE TABLE IF NOT EXISTS social_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  entity_id UUID REFERENCES entities(id),
  eligibility_criteria TEXT[],
  benefits TEXT[],
  application_process TEXT,
  contact_info TEXT,
  website_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50), -- 'alert', 'info', 'emergency', 'service_update'
  target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'specific_users'
  entity_id UUID REFERENCES entities(id),
  is_active BOOLEAN DEFAULT true,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT NOT NULL,
  pqrsd_request_id UUID REFERENCES pqrsd_requests(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50), -- 'follow_up', 'deadline', 'status_update'
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL, -- 'message_received', 'procedure_searched', 'pqrsd_created', etc.
  telegram_user_id BIGINT,
  entity_id UUID REFERENCES entities(id),
  procedure_id UUID REFERENCES procedures(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_procedures_entity ON procedures(entity_id);
CREATE INDEX idx_procedures_category ON procedures(category);
CREATE INDEX idx_pqrsd_telegram_user ON pqrsd_requests(telegram_user_id);
CREATE INDEX idx_pqrsd_entity ON pqrsd_requests(entity_id);
CREATE INDEX idx_pqrsd_status ON pqrsd_requests(status);
CREATE INDEX idx_pqrsd_tracking ON pqrsd_requests(tracking_number);
CREATE INDEX idx_conversations_user ON conversations(telegram_user_id);
CREATE INDEX idx_conversations_active ON conversations(is_active);
CREATE INDEX idx_reminders_user ON reminders(telegram_user_id);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_for, sent);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
