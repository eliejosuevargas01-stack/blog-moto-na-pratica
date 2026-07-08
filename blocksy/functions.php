<?php
/**
 * Blocksy functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Blocksy
 */

if (version_compare(PHP_VERSION, '5.7.0', '<')) {
	require get_template_directory() . '/inc/php-fallback.php';
	return;
}

require get_template_directory() . '/inc/init.php';

if (!function_exists('moto_render_post_tag')) {
	function moto_render_post_tag($post_id) {
		$cats = get_the_category($post_id);

		if (!empty($cats) && !is_wp_error($cats)) {
			return esc_html($cats[0]->name);
		}

		return 'Post';
	}
}

add_shortcode('moto_posts_grid', function ($atts) {
    $atts = shortcode_atts([
        'posts_per_page' => 5,
        'category'       => '',
    ], $atts, 'moto_posts_grid');

    $args = [
        'post_type'           => 'post',
        'post_status'         => 'publish',
        'posts_per_page'      => (int) $atts['posts_per_page'],
        'ignore_sticky_posts' => false,
    ];

    if (!empty($atts['category'])) {
        $args['category_name'] = sanitize_title($atts['category']);
    }

    $query = new WP_Query($args);

    if (!$query->have_posts()) {
        return '';
    }

    ob_start();
    ?>
    <div class="moto-posts-section">
      <?php if ($query->have_posts()) : $query->the_post(); ?>
        <article class="post-card post-card-featured">
          <a href="<?php the_permalink(); ?>" class="post-link">
            <div class="post-image post-image-featured">
              <?php if (has_post_thumbnail()) : ?>
                <?php the_post_thumbnail('large'); ?>
              <?php endif; ?>
              <span class="post-tag">
                <?php echo moto_render_post_tag(get_the_ID()); ?>
              </span>
            </div>

            <div class="post-body post-body-featured">
              <h3 class="post-title post-title-featured"><?php the_title(); ?></h3>
              <p class="post-excerpt post-excerpt-featured">
                <?php echo esc_html(wp_trim_words(get_the_excerpt(), 30)); ?>
              </p>

              <div class="post-footer">
                <span class="post-meta">
                  <?php echo esc_html(get_the_date('j M Y')); ?>
                </span>
                <span class="post-read">
                  Ler
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          </a>
        </article>
      <?php endif; ?>

      <div class="posts-grid">
        <?php while ($query->have_posts()) : $query->the_post(); ?>
          <article class="post-card post-card-small">
            <a href="<?php the_permalink(); ?>" class="post-link">
              <div class="post-image post-image-small">
                <?php if (has_post_thumbnail()) : ?>
                  <?php the_post_thumbnail('medium_large'); ?>
                <?php endif; ?>
                <span class="post-tag">
                  <?php echo moto_render_post_tag(get_the_ID()); ?>
                </span>
              </div>

              <div class="post-body post-body-small">
                <h3 class="post-title post-title-small"><?php the_title(); ?></h3>
                <p class="post-excerpt post-excerpt-small">
                  <?php echo esc_html(wp_trim_words(get_the_excerpt(), 18)); ?>
                </p>
                <div class="post-meta">
                  <?php echo esc_html(get_the_date('j M Y')); ?>
                </div>
              </div>
            </a>
          </article>
        <?php endwhile; ?>
      </div>

      <div class="load-more-wrap">
        <a class="load-more-button" href="<?php echo esc_url(get_permalink(get_option('page_for_posts')) ?: home_url('/')); ?>">
          Carregar mais posts
        </a>
      </div>
    </div>
    <?php
    wp_reset_postdata();
    return ob_get_clean();
});

add_shortcode('moto_about', function ($atts) {
    $atts = shortcode_atts([
        'title'       => 'Sobre o blog',
        'image'       => '',
        'text'        => 'Motociclista por paixão, dono de uma Fazer 250 Solid Grey 2026. Escrevo sobre o que vivo na estrada - sem patrocinador, sem jabá. Só experiência real.',
        'image_alt'   => 'Dono do blog na estrada',
    ], $atts, 'moto_about');

    ob_start();
    ?>
    <div class="sidebar-card">
      <div class="sidebar-title-wrap">
        <span class="sidebar-bar"></span>
        <h3 class="sidebar-title"><?php echo esc_html($atts['title']); ?></h3>
      </div>

      <?php if (!empty($atts['image'])) : ?>
        <div class="sidebar-image">
          <img src="<?php echo esc_url($atts['image']); ?>" alt="<?php echo esc_attr($atts['image_alt']); ?>">
        </div>
      <?php endif; ?>

      <p class="sidebar-text">
        <?php echo esc_html($atts['text']); ?>
      </p>
    </div>
    <?php
    return ob_get_clean();
});

add_shortcode('moto_categories', function ($atts) {
    $atts = shortcode_atts([
        'title'      => 'Categorias',
        'hide_empty' => 1,
        'orderby'    => 'count',
        'order'      => 'DESC',
    ], $atts, 'moto_categories');

    $args = [
        'taxonomy'   => 'category',
        'hide_empty' => (bool) $atts['hide_empty'],
        'orderby'    => sanitize_key($atts['orderby']),
        'order'      => strtoupper($atts['order']) === 'ASC' ? 'ASC' : 'DESC',
    ];

    $categories = get_categories($args);

    if (empty($categories) || is_wp_error($categories)) {
        return '';
    }

    ob_start();
    ?>
    <div class="sidebar-card">
      <div class="sidebar-title-wrap">
        <span class="sidebar-bar"></span>
        <h3 class="sidebar-title"><?php echo esc_html($atts['title']); ?></h3>
      </div>

      <ul class="sidebar-list">
        <?php foreach ($categories as $cat) : ?>
          <li>
            <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>" class="sidebar-list-link">
              <span class="sidebar-list-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <?php echo esc_html($cat->name); ?>
              </span>
              <span class="sidebar-count"><?php echo esc_html($cat->count); ?></span>
            </a>
          </li>
        <?php endforeach; ?>
      </ul>
    </div>
    <?php
    return ob_get_clean();
});

add_shortcode('moto_tags', function ($atts) {
    $atts = shortcode_atts([
        'title'      => 'Tags',
        'hide_empty' => 1,
        'orderby'    => 'count',
        'order'      => 'DESC',
        'number'     => 12,
    ], $atts, 'moto_tags');

    $args = [
        'taxonomy'   => 'post_tag',
        'hide_empty' => (bool) $atts['hide_empty'],
        'orderby'    => sanitize_key($atts['orderby']),
        'order'      => strtoupper($atts['order']) === 'ASC' ? 'ASC' : 'DESC',
        'number'     => (int) $atts['number'],
    ];

    $tags = get_terms($args);

    if (empty($tags) || is_wp_error($tags)) {
        return '';
    }

    ob_start();
    ?>
    <div class="sidebar-card">
      <div class="sidebar-title-wrap">
        <span class="sidebar-bar"></span>
        <h3 class="sidebar-title"><?php echo esc_html($atts['title']); ?></h3>
      </div>

      <div class="tag-list">
        <?php foreach ($tags as $tag) : ?>
          <a href="<?php echo esc_url(get_tag_link($tag->term_id)); ?>" class="tag-list-link">
            <?php echo esc_html($tag->name); ?>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
    <?php
    return ob_get_clean();
});

add_shortcode('moto_newsletter', function ($atts) {
    $atts = shortcode_atts([
        'title' => 'Receba novos posts',
        'text'  => 'Sem spam. Só artigo novo quando sai.',
        'button_text' => 'Inscrever',
        'placeholder' => 'seu@email.com',
        'action' => '',
    ], $atts, 'moto_newsletter');

    ob_start();
    ?>
    <div class="sidebar-card sidebar-newsletter">
      <h3 class="newsletter-title"><?php echo esc_html($atts['title']); ?></h3>
      <p class="newsletter-text"><?php echo esc_html($atts['text']); ?></p>

      <form class="sidebar-newsletter-form" method="post" action="<?php echo esc_url($atts['action']); ?>">
        <input
          type="email"
          name="email"
          placeholder="<?php echo esc_attr($atts['placeholder']); ?>"
          aria-label="<?php echo esc_attr($atts['placeholder']); ?>"
        >
        <button type="submit"><?php echo esc_html($atts['button_text']); ?></button>
      </form>
    </div>
    <?php
    return ob_get_clean();
});

/**
 * Enqueue Google Fonts and custom CSS styles for the single post page.
 */
add_action('wp_enqueue_scripts', function() {
    if (is_single()) {
        wp_enqueue_style('moto-google-fonts', 'https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Barlow:wght@400;500;600&display=swap', array(), null);
        wp_enqueue_style('moto-single-style', get_template_directory_uri() . '/custom-single.css', array(), '1.1.0');
    }
});

/**
 * Register a dynamic sidebar for the single post page.
 */
add_action('widgets_init', function() {
    register_sidebar([
        'name'          => 'Moto Sidebar',
        'id'            => 'moto-sidebar',
        'before_widget' => '<div id="%1$s" class="moto-sidebar-card widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<div class="moto-sidebar-header"><span class="moto-sidebar-bar"></span><h3 class="moto-sidebar-title">',
        'after_title'   => '</h3></div>',
    ]);
});

/**
 * Register block pattern category and the "Hero do Post" reusable pattern.
 *
 * Usage: in the post editor, open the Block Inserter ("+"), go to "Patterns",
 * select "Moto na Prática" and insert "Hero do Post" as the FIRST block.
 * The Cover block will show your featured image live with a drag-and-drop
 * focal point picker — no preview needed.
 */
add_action('init', function() {
    if (!function_exists('register_block_pattern')) return;

    register_block_pattern_category('moto-single', [
        'label' => '🏍 Moto na Prática',
    ]);

    $pattern_content = '<!-- wp:cover {"useFeaturedImage":true,"dimRatio":0,"isDark":true,"align":"full","minHeight":60,"minHeightUnit":"vh","className":"moto-hero-cover","contentPosition":"bottom left"} -->'
        . '<div class="wp-block-cover alignfull moto-hero-cover has-custom-content-position is-position-bottom-left" style="min-height:60vh">'
        . '<span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim"></span>'
        . '<div class="wp-block-cover__inner-container">'
        . '<!-- wp:paragraph {"className":"moto-back-link"} --><p class="moto-back-link"><a href="javascript:history.back()">&#8592; Voltar</a></p><!-- /wp:paragraph -->'
        . '<!-- wp:group {"className":"moto-hero-badges","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"12px"}}} -->'
        . '<div class="wp-block-group moto-hero-badges">'
        . '<!-- wp:post-terms {"term":"category","className":"moto-badge","separator":""} /-->'
        . '<!-- wp:post-date {"format":"j M Y","className":"moto-post-date-badge"} /-->'
        . '</div>'
        . '<!-- /wp:group -->'
        . '<!-- wp:post-title {"level":1,"className":"moto-hero-title","textColor":"white","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}}} /-->'
        . '</div>'
        . '</div>'
        . '<!-- /wp:cover -->';

    register_block_pattern('moto-single/hero', [
        'title'       => 'Hero do Post',
        'description' => 'Seção hero com imagem destacada, ponto focal drag-and-drop, categoria e título. Insira como PRIMEIRO bloco do post.',
        'categories'  => ['moto-single'],
        'content'     => $pattern_content,
    ]);

    // Newsletter Pattern
    register_block_pattern('moto-single/newsletter', [
        'title'       => 'Newsletter Moto',
        'description' => 'Card de newsletter estilizado para a barra lateral ou conteúdo.',
        'categories'  => ['moto-single'],
        'content'     => '<!-- wp:group {"className":"moto-sidebar-card moto-sidebar-newsletter"} -->
            <div class="wp-block-group moto-sidebar-card moto-sidebar-newsletter">
            <!-- wp:heading {"level":3,"className":"moto-newsletter-title"} --><h3 class="moto-newsletter-title">Receba novos posts</h3><!-- /wp:heading -->
            <!-- wp:paragraph {"className":"moto-newsletter-text"} --><p class="moto-newsletter-text">Sem spam. Só artigo novo quando sai.</p><!-- /wp:paragraph -->
            <!-- wp:html -->
            <form class="moto-newsletter-form"><input type="email" placeholder="seu@email.com" class="moto-newsletter-input" /><button type="submit" class="moto-newsletter-submit-btn">Inscrever</button></form>
            <!-- /wp:html -->
            </div><!-- /wp:group -->',
    ]);

    // About Pattern
    register_block_pattern('moto-single/about', [
        'title'       => 'Sobre o Blog (Sidebar)',
        'description' => 'Card "Sobre o blog" para a barra lateral.',
        'categories'  => ['moto-single'],
        'content'     => '<!-- wp:group {"className":"moto-sidebar-card"} -->
            <div class="wp-block-group moto-sidebar-card">
            <!-- wp:group {"className":"moto-sidebar-header","layout":{"type":"flex","flexWrap":"nowrap"}} -->
            <div class="wp-block-group moto-sidebar-header"><span class="moto-sidebar-bar"></span><!-- wp:heading {"level":3,"className":"moto-sidebar-title"} --><h3 class="moto-sidebar-title">Sobre o blog</h3><!-- /wp:heading --></div>
            <!-- /wp:group -->
            <!-- wp:image {"className":"moto-sidebar-about-img-wrap"} --><figure class="wp-block-image moto-sidebar-about-img-wrap"><img src="https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=640&h=280&fit=crop" alt="" class="moto-sidebar-about-img"/></figure><!-- /wp:image -->
            <!-- wp:paragraph {"className":"moto-sidebar-about-text"} --><p class="moto-sidebar-about-text">Motociclista por paixão, dono de uma Fazer 250 Solid Grey 2026. Escrevo sobre o que vivo na estrada.</p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"className":"moto-sidebar-about-link"} --><p class="moto-sidebar-about-link"><a href="/sobre">Conhecer mais →</a></p><!-- /wp:paragraph -->
            </div><!-- /wp:group -->',
    ]);
});