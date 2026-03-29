CREATE TABLE IF NOT EXISTS websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    favicon_url TEXT,
    primary_color VARCHAR(7),
    bookmark_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por el campo `name`, útil para encontrar sitios web por su nombre exacto.
CREATE INDEX IF NOT EXISTS idx_websites_name ON websites (name);

-- Habilita búsquedas parciales y difusas sobre el campo `name` usando trigramas, facilitando la búsqueda por coincidencias aproximadas o fragmentos del nombre.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_websites_name_trgm ON websites USING gin(name gin_trgm_ops);

-- Optimiza las consultas que ordenan los sitios web por fecha de creación descendente, útil para mostrar los sitios más recientes primero.
CREATE INDEX IF NOT EXISTS idx_websites_created_at ON websites (created_at DESC);

-- Facilita las consultas que ordenan los sitios web según la cantidad de marcadores asociados, permitiendo listar los sitios más populares.
CREATE INDEX IF NOT EXISTS idx_websites_bookmark_count ON websites (bookmark_count DESC);