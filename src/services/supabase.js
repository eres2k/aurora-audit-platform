// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // Audits
  audits: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    
    getByStation: async (stationId) => {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('station_id', stationId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    
    getById: async (id) => {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },
    
    create: async (audit) => {
      const { data, error } = await supabase
        .from('audits')
        .insert([audit])
        .select();
      return { data, error };
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('audits')
        .update(updates)
        .eq('id', id)
        .select();
      return { data, error };
    },
    
    delete: async (id) => {
      const { data, error } = await supabase
        .from('audits')
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },
  
  // Questions
  questions: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('order_index', { ascending: true });
      return { data, error };
    },
    
    getByCategory: async (category) => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category)
        .order('order_index', { ascending: true });
      return { data, error };
    },
    
    create: async (question) => {
      const { data, error } = await supabase
        .from('questions')
        .insert([question])
        .select();
      return { data, error };
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select();
      return { data, error };
    },
    
    delete: async (id) => {
      const { data, error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },
  
  // Templates
  templates: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name', { ascending: true });
      return { data, error };
    },
    
    getById: async (id) => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },
    
    create: async (template) => {
      const { data, error } = await supabase
        .from('templates')
        .insert([template])
        .select();
      return { data, error };
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select();
      return { data, error };
    },
    
    delete: async (id) => {
      const { data, error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },
  
  // Responses
  responses: {
    getByAudit: async (auditId) => {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('audit_id', auditId);
      return { data, error };
    },
    
    create: async (response) => {
      const { data, error } = await supabase
        .from('responses')
        .insert([response])
        .select();
      return { data, error };
    },
    
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('responses')
        .update(updates)
        .eq('id', id)
        .select();
      return { data, error };
    },
    
    upsert: async (response) => {
      const { data, error } = await supabase
        .from('responses')
        .upsert(response, { 
          onConflict: 'audit_id,question_id' 
        })
        .select();
      return { data, error };
    }
  },
  
  // Files/Attachments
  files: {
    upload: async (file, path) => {
      const { data, error } = await supabase.storage
        .from('audit-attachments')
        .upload(path, file);
      return { data, error };
    },
    
    getUrl: (path) => {
      const { data } = supabase.storage
        .from('audit-attachments')
        .getPublicUrl(path);
      return data.publicUrl;
    },
    
    delete: async (path) => {
      const { data, error } = await supabase.storage
        .from('audit-attachments')
        .remove([path]);
      return { data, error };
    }
  }
};

/* 
SUPABASE DATABASE SETUP SQL
Run these commands in your Supabase SQL Editor:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audits table
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  station_id VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  assigned_to UUID,
  created_by UUID NOT NULL,
  template_id UUID,
  department VARCHAR(100),
  location VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  progress INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  station_id VARCHAR(10),
  required BOOLEAN DEFAULT false,
  options JSONB,
  validation JSONB,
  order_index INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  station_id VARCHAR(10),
  questions JSONB,
  is_public BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  answer JSONB,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(audit_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX idx_audits_station_id ON audits(station_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_created_by ON audits(created_by);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_station_id ON questions(station_id);
CREATE INDEX idx_responses_audit_id ON responses(audit_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for attachments
-- Run this in the Supabase Dashboard under Storage
-- 1. Create a new bucket called 'audit-attachments'
-- 2. Make it public or configure policies as needed

-- Sample data for testing (optional)
INSERT INTO questions (text, type, category, station_id, required, order_index) VALUES
  ('Is the equipment properly calibrated?', 'boolean', 'Equipment Check', 'DVI1', true, 1),
  ('Visual inspection passed?', 'boolean', 'Visual Inspection', 'DVI1', true, 2),
  ('Surface defects detected?', 'select', 'Quality Control', 'DVI2', true, 3),
  ('Number of defects found', 'number', 'Quality Control', 'DVI2', false, 4),
  ('Comments on inspection', 'text', 'General', 'DVI3', false, 5),
  ('Process compliance verified?', 'boolean', 'Compliance', 'DAP5', true, 6),
  ('Final approval granted?', 'boolean', 'Sign-off', 'DAP8', true, 7);

-- Set up RLS policies (adjust based on your auth requirements)
CREATE POLICY "Users can view all audits" ON audits
  FOR SELECT USING (true);

CREATE POLICY "Users can create audits" ON audits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own audits" ON audits
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own audits" ON audits
  FOR DELETE USING (created_by = auth.uid());

-- Similar policies for other tables
CREATE POLICY "Users can view all questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Users can view all templates" ON templates
  FOR SELECT USING (true);

CREATE POLICY "Users can manage responses" ON responses
  FOR ALL USING (true);
*/