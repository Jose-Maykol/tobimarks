CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES websites(id),
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,

    url TEXT NOT NULL,
    title VARCHAR(500),
    description TEXT,
    
    og_title VARCHAR(500),
    og_description TEXT,
    og_image_url TEXT,

    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,

    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,

    embedding VECTOR(1536),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    search_vector tsvector
);

-- Restricción única para evitar URLs duplicadas por usuario en marcadores activos (no eliminados), previniendo duplicados.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_bookmark_url ON bookmarks (user_id, url) WHERE deleted_at IS NULL;

-- Índice para acelerar consultas que filtran marcadores por usuario, como al listar todos los marcadores de un usuario específico.
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id);

-- Índice para optimizar la obtención de marcadores favoritos de un usuario, filtrando por el campo `is_favorite`.
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_favorite ON bookmarks (user_id, is_favorite) WHERE is_favorite = true;

-- Índice para facilitar la consulta de marcadores archivados de un usuario, filtrando por el campo `is_archived`.
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_archived ON bookmarks (user_id, is_archived) WHERE is_archived = true;

-- Índice para ordenar rápidamente los marcadores de un usuario por fecha de creación, útil para mostrar los más recientes.
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created_at ON bookmarks (user_id, created_at DESC);

-- Índice para optimizar el ordenamiento de marcadores por la última fecha de acceso, útil para mostrar los más utilizados recientemente.
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_last_accessed ON bookmarks (user_id, last_accessed_at DESC);

-- Índice para facilitar el ordenamiento de marcadores por cantidad de accesos, permitiendo destacar los más visitados.
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_access_count ON bookmarks (user_id, access_count DESC);

-- Índice para habilitar búsquedas de texto completo sobre los marcadores, mejorando la eficiencia de las búsquedas por contenido textual.
CREATE INDEX IF NOT EXISTS idx_bookmarks_search_vector ON bookmarks USING gin(search_vector);

-- Índice para acelerar la consulta de marcadores por colección, útil para listar todos los marcadores de una colección específica.
CREATE INDEX IF NOT EXISTS idx_bookmarks_collection_id ON bookmarks (collection_id);