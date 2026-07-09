<?php
/**
 * Custom single post template — Moto na Prática
 *
 * This template uses a manual Hero (created via Gutenberg blocks)
 * while maintaining a structured sidebar that doesn't overlap full-width elements.
 *
 * @package Blocksy
 */

if (have_posts()) {
    the_post();
}

$post_id = get_the_ID();

// Parse post content blocks to extract the Hero block (moto-hero-cover)
$post_content = get_the_content();
$blocks = parse_blocks($post_content);

$hero_block = null;
$remaining_blocks = [];

foreach ($blocks as $block) {
    $is_hero = false;

    // Check if this block is the custom Hero cover block
    if (
        (isset($block['attrs']['className']) && strpos($block['attrs']['className'], 'moto-hero-cover') !== false) ||
        (isset($block['innerHTML']) && strpos($block['innerHTML'], 'moto-hero-cover') !== false)
    ) {
        $is_hero = true;
    }

    if ($is_hero && !$hero_block) {
        $hero_block = $block;
    } else {
        $remaining_blocks[] = $block;
    }
}
?>

<div class="moto-single-post-container">

    <?php if ($hero_block) : ?>
        <!-- HERO BLOCK (OUTSIDE THE GRID TO PREVENT SIDEBAR OVERLAP) -->
        <div class="moto-hero-outside">
            <?php echo apply_filters('the_content', render_block($hero_block)); ?>
        </div>
    <?php endif; ?>

    <!-- MAIN GRID CONTAINER -->
    <div class="moto-content-layout-grid">

        <main class="moto-main-column">
            <div class="moto-post-content">
                <?php
                if ($hero_block) {
                    $remaining_content = '';
                    foreach ($remaining_blocks as $block) {
                        $remaining_content .= render_block($block);
                    }
                    echo apply_filters('the_content', $remaining_content);
                } else {
                    the_content();
                }
                ?>
            </div>

            <!-- Tags (Legacy support if not in blocks) -->
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
        </main>

        <aside class="moto-sidebar-column">
            <?php if (is_active_sidebar('moto-sidebar')) : ?>
                <?php dynamic_sidebar('moto-sidebar'); ?>
            <?php else : ?>
                <!-- Fallback content if sidebar is empty -->
                <div class="moto-sidebar-card">
                    <div class="moto-sidebar-header">
                        <span class="moto-sidebar-bar"></span>
                        <h3 class="moto-sidebar-title">Sobre o blog</h3>
                    </div>
                    <p class="moto-sidebar-about-text">
                        Motociclista por paixão, dono de uma Fazer 250 Solid Grey 2026. Escrevo sobre o que vivo na estrada.
                    </p>
                </div>
            <?php endif; ?>
        </aside>

    </div><!-- .moto-content-layout-grid -->

</div><!-- .moto-single-post-container -->

<?php
wp_reset_query();
?>
