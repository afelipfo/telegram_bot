-- Seed initial entities and procedures for MedellínBot

-- Insert main entities
INSERT INTO entities (name, code, description, contact_email, contact_phone, website_url, category, is_active) VALUES
('Alcaldía de Medellín', 'ALCALDIA', 'Gobierno municipal de Medellín', 'contacto@medellin.gov.co', '(604) 385 5555', 'https://www.medellin.gov.co', 'municipal', true),
('EPM - Empresas Públicas de Medellín', 'EPM', 'Servicios públicos domiciliarios', 'servicio@epm.com.co', '(604) 444 4444', 'https://www.epm.com.co', 'utilities', true),
('Metro de Medellín', 'METRO', 'Sistema de transporte masivo', 'info@metrodemedellin.gov.co', '(604) 454 5454', 'https://www.metrodemedellin.gov.co', 'municipal', true),
('Policía Nacional', 'POLICIA', 'Seguridad ciudadana', 'contacto@policia.gov.co', '123', 'https://www.policia.gov.co', 'security', true),
('Secretaría de Salud', 'SALUD', 'Servicios de salud municipal', 'salud@medellin.gov.co', '(604) 385 5000', 'https://www.medellin.gov.co/salud', 'health', true),
('Secretaría de Educación', 'EDUCACION', 'Educación municipal', 'educacion@medellin.gov.co', '(604) 385 5100', 'https://www.medellin.gov.co/educacion', 'education', true);

-- Insert sample procedures
INSERT INTO procedures (entity_id, name, description, requirements, cost, estimated_time, process_steps, online_available, online_url, category, keywords) 
SELECT 
  e.id,
  'Certificado de Residencia',
  'Documento que certifica el lugar de residencia del ciudadano en Medellín',
  ARRAY['Cédula de ciudadanía', 'Recibo de servicio público reciente', 'Formulario diligenciado'],
  15000,
  '3-5 días hábiles',
  ARRAY['Solicitar cita en línea o presencial', 'Presentar documentos requeridos', 'Pagar el valor del certificado', 'Recoger el certificado'],
  true,
  'https://www.medellin.gov.co/tramites/certificado-residencia',
  'civil',
  ARRAY['certificado', 'residencia', 'domicilio', 'vivienda']
FROM entities e WHERE e.code = 'ALCALDIA';

INSERT INTO procedures (entity_id, name, description, requirements, cost, estimated_time, process_steps, online_available, category, keywords)
SELECT 
  e.id,
  'Solicitud de Conexión de Agua',
  'Trámite para solicitar nueva conexión del servicio de acueducto',
  ARRAY['Cédula de ciudadanía', 'Certificado de libertad y tradición del inmueble', 'Planos aprobados'],
  250000,
  '15-20 días hábiles',
  ARRAY['Radicar solicitud en oficina EPM', 'Inspección técnica del inmueble', 'Cotización y pago', 'Instalación del servicio'],
  true,
  'utilities',
  ARRAY['agua', 'acueducto', 'conexión', 'servicio público']
FROM entities e WHERE e.code = 'EPM';

INSERT INTO procedures (entity_id, name, description, requirements, cost, estimated_time, process_steps, online_available, category, keywords)
SELECT 
  e.id,
  'Tarjeta Cívica del Metro',
  'Obtención de tarjeta personalizada para el sistema Metro',
  ARRAY['Cédula de ciudadanía', 'Fotografía reciente'],
  6000,
  'Inmediato',
  ARRAY['Acercarse a taquilla del Metro', 'Presentar documentos', 'Tomar fotografía', 'Pagar y recibir tarjeta'],
  false,
  'municipal',
  ARRAY['metro', 'tarjeta', 'transporte', 'cívica']
FROM entities e WHERE e.code = 'METRO';

INSERT INTO procedures (entity_id, name, description, requirements, cost, estimated_time, process_steps, online_available, category, keywords)
SELECT 
  e.id,
  'Denuncia por Hurto',
  'Registro de denuncia por hurto de bienes',
  ARRAY['Cédula de ciudadanía', 'Descripción detallada de los hechos', 'Pruebas si las tiene'],
  0,
  '1-2 horas',
  ARRAY['Acudir a CAI o estación de policía', 'Relatar los hechos', 'Firmar denuncia', 'Obtener número de caso'],
  true,
  'security',
  ARRAY['denuncia', 'hurto', 'robo', 'policía', 'seguridad']
FROM entities e WHERE e.code = 'POLICIA';

-- Insert social programs
INSERT INTO social_programs (entity_id, name, description, eligibility_criteria, benefits, application_process, website_url)
SELECT 
  e.id,
  'Medellín Me Cuida',
  'Programa de atención integral en salud para población vulnerable',
  ARRAY['Residir en Medellín', 'Estar en condición de vulnerabilidad', 'No tener afiliación a salud'],
  ARRAY['Atención médica gratuita', 'Medicamentos subsidiados', 'Exámenes de laboratorio'],
  'Inscripción en centros de salud municipales con documento de identidad',
  'https://www.medellin.gov.co/medellinmecuida'
FROM entities e WHERE e.code = 'SALUD';

INSERT INTO social_programs (entity_id, name, description, eligibility_criteria, benefits, application_process, website_url)
SELECT 
  e.id,
  'Buen Comienzo',
  'Programa de atención integral a la primera infancia',
  ARRAY['Niños de 0 a 5 años', 'Residir en Medellín', 'Estar en estratos 1, 2 o 3'],
  ARRAY['Atención nutricional', 'Educación inicial', 'Acompañamiento psicosocial'],
  'Inscripción en jardines infantiles del programa con registro civil del niño',
  'https://www.medellin.gov.co/buencomienzo'
FROM entities e WHERE e.code = 'EDUCACION';
