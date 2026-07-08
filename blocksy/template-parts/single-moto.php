<?php
/**
 * Custom single post template — Moto na Prática
 *
 * Hero section is now a Gutenberg Cover block (inserted via the "Hero do Post"
 * block pattern). This gives full WYSIWYG editing and a built-in focal point
 * picker directly in the post editor — no publishing needed to see the result.
 *
 * How to use when creating a new post:
 *  1. Open the post in the block editor.
 *  2. Click the "+" block inserter.
 *  3. Go to the "Patterns" tab → "🏍 Moto na Prática".
 *  4. Click "Hero do Post" — it inserts the Cover block as the first block.
 *  5. Drag the ⊕ focal point crosshair on the image to frame your shot.
 *  6. Write the body content below the Cover block normally.
 *
 * @package Blocksy
 */

if (have_posts()) {
    the_post();
}

$post_id = get_the_ID();

?>

<div class="moto-single-post-container">

    <!-- =============================================
         MAIN CONTENT AREA (Hero + Body + Sidebar)
         ============================================= -->
    <div class="moto-content-area">
        <div class="moto-main-column">

            <div class="moto-post-content-wrap">
                <?php the_content(); ?>
            </div>

            <!-- Tags -->
            <?php
            $post_tags = get_the_tags();
            if ($post_tags) :
            ?>
                <div class="moto-tags-section">
                    <span class="moto-tags-label">Tags:</span>
                    <div class="moto-tags-list">
                        <?php foreach ($post_tags as $tag) : ?>
                            <a href="<?php echo esc_url(get_tag_link($tag->term_id)); ?>" class="moto-tag-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l4.71-4.71c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                                <?php echo esc_html($tag->name); ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Related posts -->
            <?php
            $categories    = wp_get_post_categories($post_id);
            $related_query = new WP_Query([
                'category__in'   => $categories,
                'post__not_in'   => [$post_id],
                'posts_per_page' => 2,
                'post_status'    => 'publish',
            ]);
            $related_posts = $related_query->posts;

            // Fallback: fill with latest posts if fewer than 2 related found
            if (count($related_posts) < 2) {
                $exclude_ids = array_merge([$post_id], array_column($related_posts, 'ID'));
                $fallback    = new WP_Query([
                    'post_type'      => 'post',
                    'post__not_in'   => $exclude_ids,
                    'posts_per_page' => 2 - count($related_posts),
                    'post_status'    => 'publish',
                ]);
                $related_posts = array_merge($related_posts, $fallback->posts);
            }

            if (!empty($related_posts)) :
            ?>
                <div class="moto-related-section">
                    <div class="moto-section-header">
                        <span class="moto-section-bar"></span>
                        <h3 class="moto-section-title">Posts relacionados</h3>
                    </div>
                    <div class="moto-related-grid">
                        <?php foreach ($related_posts as $r_post) :
                            $r_id         = $r_post->ID;
                            $r_title      = get_the_title($r_id);
                            $r_permalink  = get_permalink($r_id);
                            $r_img        = get_the_post_thumbnail_url($r_id, 'medium_large')
                                            ?: 'https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=600&h=340&fit=crop&auto=format';
                            $r_tag        = moto_render_post_tag($r_id);
                            $r_cats       = get_the_category($r_id);
                            $r_cat_slug   = !empty($r_cats) ? sanitize_html_class($r_cats[0]->slug) : 'default';
                            $r_tag_class  = 'moto-tag-' . $r_cat_slug;
                            $r_words      = str_word_count(strip_tags(get_post_field('post_content', $r_id)));
                            $r_read_time  = ceil($r_words / 200) . ' min';
                            $r_date       = get_the_date('j M Y', $r_id);
                        ?>
                            <article class="moto-related-card" onclick="window.location='<?php echo esc_url($r_permalink); ?>'">
                                <div class="moto-related-card-img-wrap">
                                    <img src="<?php echo esc_url($r_img); ?>" alt="<?php echo esc_attr($r_title); ?>" class="moto-related-card-img" loading="lazy" />
                                    <span class="moto-related-card-badge <?php echo esc_attr($r_tag_class); ?>"><?php echo esc_html($r_tag); ?></span>
                                </div>
                                <div class="moto-related-card-body">
                                    <h4 class="moto-related-card-title">
                                        <a href="<?php echo esc_url($r_permalink); ?>"><?php echo esc_html($r_title); ?></a>
                                    </h4>
                                    <span class="moto-related-card-meta">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        <?php echo esc_html($r_read_time); ?> · <?php echo esc_html($r_date); ?>
                                    </span>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>

        </div><!-- .moto-main-column -->

        <!-- Sidebar -->
        <aside class="moto-sidebar-column">
            <?php if (is_active_sidebar('moto-sidebar')) : ?>
                <?php dynamic_sidebar('moto-sidebar'); ?>
            <?php else : ?>
                <!-- Fallback: About Card -->
                <div class="moto-sidebar-card">
                    <div class="moto-sidebar-header">
                        <span class="moto-sidebar-bar"></span>
                        <h3 class="moto-sidebar-title">Sobre o blog</h3>
                    </div>
                    <div class="moto-sidebar-about-img-wrap">
                        <img src="https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=640&h=280&fit=crop&auto=format" alt="Na estrada" class="moto-sidebar-about-img" loading="lazy" />
                    </div>
                    <p class="moto-sidebar-about-text">
                        Motociclista por paixão, dono de uma Fazer 250 Solid Grey 2026. Escrevo sobre o que vivo na estrada — sem patrocinador, sem jabá.
                    </p>
                    <a href="<?php echo esc_url(home_url('/sobre/')); ?>" class="moto-sidebar-about-link">
                        Conhecer mais
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                </div>

                <!-- Fallback: Categories Card -->
                <div class="moto-sidebar-card">
                    <div class="moto-sidebar-header">
                        <span class="moto-sidebar-bar"></span>
                        <h3 class="moto-sidebar-title">Categorias</h3>
                    </div>
                    <ul class="moto-sidebar-categories-list">
                        <?php
                        $cats = get_categories(['hide_empty' => true, 'orderby' => 'count', 'order' => 'DESC']);
                        foreach ($cats as $cat) :
                        ?>
                            <li>
                                <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>" class="moto-sidebar-cat-link">
                                    <span class="moto-sidebar-cat-name">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
                                        <?php echo esc_html($cat->name); ?>
                                    </span>
                                    <span class="moto-sidebar-cat-count"><?php echo esc_html($cat->count); ?></span>
                                </a>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>

                <!-- Fallback: Newsletter Card -->
                <div class="moto-sidebar-card moto-sidebar-newsletter">
                    <h3 class="moto-newsletter-title">Receba novos posts</h3>
                    <p class="moto-newsletter-text">Sem spam. Só artigo novo quando sai.</p>
                    <form class="moto-newsletter-form" action="" method="POST">
                        <input type="email" name="email" placeholder="seu@email.com" required class="moto-newsletter-input" />
                        <button type="submit" class="moto-newsletter-submit-btn">Inscrever</button>
                    </form>
                </div>
            <?php endif; ?>
        </aside><!-- .moto-sidebar-column -->
    </div><!-- .moto-content-area -->

</div><!-- .moto-single-post-container -->

<?php
have_posts();
wp_reset_query();
?>
