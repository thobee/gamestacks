-- Mock games seed data for Gamestacks
-- Safe to run multiple times: inserts only when title does not already exist.
-- Works with either schema shape:
--   A) image_url/download_url/system_requirements
--   B) cover_image_url/download_link/system_requirements_* columns

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'games'
      AND column_name = 'image_url'
  ) THEN
    EXECUTE $seed_a$
      INSERT INTO games (
        title,
        description,
        category,
        price_naira,
        image_url,
        download_url,
        system_requirements,
        is_published,
        rating
      )
      SELECT v.title, v.description, v.category, v.price_naira, v.image_url, v.download_url, v.system_requirements, v.is_published, v.rating
      FROM (
        VALUES
          (
            'EA FC 25',
            'Latest football simulation with updated squads and leagues.',
            'Sports',
            18500,
            'https://images.unsplash.com/photo-1517466787929-bc90951d0974',
            'https://example.com/download/fc25',
            'Intel i5, 8GB RAM, GTX 1050, 80GB storage',
            true,
            4.7
          ),
          (
            'Mortal Kombat 1',
            'Story-driven fighting game with online ranked matches.',
            'Action',
            22000,
            'https://images.unsplash.com/photo-1542751371-adc38448a05e',
            'https://example.com/download/mk1',
            'Intel i7, 16GB RAM, RTX 2060, 100GB storage',
            true,
            4.5
          ),
          (
            'Need for Speed Heat',
            'Open-world street racing with daytime events and night pursuits.',
            'Racing',
            14000,
            'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8',
            'https://example.com/download/nfs-heat',
            'Intel i5, 8GB RAM, GTX 1060, 60GB storage',
            true,
            4.3
          ),
          (
            'WWE 2K24',
            'Pro wrestling sim featuring major arenas and roster updates.',
            'Sports',
            17000,
            'https://images.unsplash.com/photo-1598550476439-6847785fcea6',
            'https://example.com/download/wwe2k24',
            'Intel i5, 8GB RAM, GTX 1650, 90GB storage',
            true,
            4.4
          ),
          (
            'Cyberpunk 2077',
            'Open-world RPG set in Night City with deep progression.',
            'RPG',
            21000,
            'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42',
            'https://example.com/download/cyberpunk',
            'Intel i7, 16GB RAM, RTX 3060, 120GB storage',
            true,
            4.6
          )
      ) AS v(title, description, category, price_naira, image_url, download_url, system_requirements, is_published, rating)
      WHERE NOT EXISTS (
        SELECT 1 FROM games g WHERE LOWER(g.title) = LOWER(v.title)
      );
    $seed_a$;
  ELSE
    EXECUTE $seed_b$
      INSERT INTO games (
        title,
        description,
        category,
        price_naira,
        cover_image_url,
        download_link,
        system_requirements_cpu,
        system_requirements_ram,
        system_requirements_gpu,
        system_requirements_storage_gb,
        is_published,
        rating,
        downloads_count
      )
      SELECT
        v.title,
        v.description,
        v.category,
        v.price_naira,
        v.cover_image_url,
        v.download_link,
        v.cpu,
        v.ram,
        v.gpu,
        v.storage,
        v.is_published,
        v.rating,
        v.downloads_count
      FROM (
        VALUES
          (
            'EA FC 25',
            'Latest football simulation with updated squads and leagues.',
            'Sports',
            18500,
            'https://images.unsplash.com/photo-1517466787929-bc90951d0974',
            'https://example.com/download/fc25',
            'Intel i5',
            '8GB',
            'GTX 1050',
            '80',
            true,
            4.7,
            1200
          ),
          (
            'Mortal Kombat 1',
            'Story-driven fighting game with online ranked matches.',
            'Action',
            22000,
            'https://images.unsplash.com/photo-1542751371-adc38448a05e',
            'https://example.com/download/mk1',
            'Intel i7',
            '16GB',
            'RTX 2060',
            '100',
            true,
            4.5,
            980
          ),
          (
            'Need for Speed Heat',
            'Open-world street racing with daytime events and night pursuits.',
            'Racing',
            14000,
            'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8',
            'https://example.com/download/nfs-heat',
            'Intel i5',
            '8GB',
            'GTX 1060',
            '60',
            true,
            4.3,
            860
          ),
          (
            'WWE 2K24',
            'Pro wrestling sim featuring major arenas and roster updates.',
            'Sports',
            17000,
            'https://images.unsplash.com/photo-1598550476439-6847785fcea6',
            'https://example.com/download/wwe2k24',
            'Intel i5',
            '8GB',
            'GTX 1650',
            '90',
            true,
            4.4,
            760
          ),
          (
            'Cyberpunk 2077',
            'Open-world RPG set in Night City with deep progression.',
            'RPG',
            21000,
            'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42',
            'https://example.com/download/cyberpunk',
            'Intel i7',
            '16GB',
            'RTX 3060',
            '120',
            true,
            4.6,
            1320
          )
      ) AS v(title, description, category, price_naira, cover_image_url, download_link, cpu, ram, gpu, storage, is_published, rating, downloads_count)
      WHERE NOT EXISTS (
        SELECT 1 FROM games g WHERE LOWER(g.title) = LOWER(v.title)
      );
    $seed_b$;
  END IF;
END $$;
