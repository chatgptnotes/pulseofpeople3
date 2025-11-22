import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iwtgbseaoztjbnvworyq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase service role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// =====================================================
// TENANT CONFIGURATIONS
// =====================================================

const tenantConfigurations = [
  {
    // BJP - Bharatiya Janata Party
    name: 'Bharatiya Janata Party',
    slug: 'bjp',
    subdomain: 'bjp',
    logo: '/logos/bjp-logo.png',
    organization_type: 'party',
    contact_email: 'contact@bjp.pulseofpeople.com',
    contact_phone: '+91-11-23348888',
    address: '6A, Deen Dayal Upadhyay Marg, New Delhi - 110002',
    city: 'New Delhi',
    state: 'Delhi',
    website: 'https://www.bjp.org',
    subscription_plan: 'pro',
    subscription_status: 'active',
    max_users: 100,
    is_active: true,
    is_public: true,
    allow_registration: true,
    domain_verified: false,

    branding: {
      logo_url: '/logos/bjp-logo.png',
      favicon_url: '/logos/bjp-favicon.ico',
      primary_color: '#FF9933', // Saffron
      secondary_color: '#138808', // Green
      accent_color: '#FFFFFF', // White
      text_color: '#212121',
      background_color: '#FFFFFF',
      header_bg_color: '#FF9933',
      footer_bg_color: '#212121',
      button_bg_color: '#FF9933',
      button_hover_color: '#E67A00',
      font_family: 'Roboto, sans-serif',
      logo_width: '180px',
      logo_height: '60px'
    },

    landing_page_config: {
      hero_title: 'सबका साथ, सबका विकास, सबका विश्वास',
      hero_subtitle: 'Empowering India with Development, Democracy, and Good Governance',
      hero_image: '/images/bjp-hero.jpg',
      hero_cta_text: 'Join the Movement',
      hero_cta_url: '/register',
      hero_secondary_cta_text: 'Our Vision',
      hero_secondary_cta_url: '/about',

      features: [
        {
          icon: 'flag',
          title: 'Nationalism First',
          description: 'Committed to national security, unity, and cultural heritage'
        },
        {
          icon: 'trending_up',
          title: 'Economic Development',
          description: 'Digital India, Make in India, and self-reliant Bharat initiatives'
        },
        {
          icon: 'people',
          title: 'Welfare Schemes',
          description: 'Ayushman Bharat, PM-Kisan, and women empowerment programs'
        },
        {
          icon: 'balance',
          title: 'Good Governance',
          description: 'Transparent, corruption-free administration with accountability'
        }
      ],

      stats: [
        { label: 'Party Members', value: '18 Crore+', icon: 'people' },
        { label: 'States Governed', value: '17', icon: 'map' },
        { label: 'Years of Service', value: '44+', icon: 'schedule' },
        { label: 'Welfare Beneficiaries', value: '50 Crore+', icon: 'volunteer_activism' }
      ],

      testimonials: [
        {
          name: 'Narendra Modi',
          role: 'Prime Minister of India',
          image: '/images/leaders/modi.jpg',
          quote: 'Together, we can build a New India - prosperous, inclusive, and progressive.'
        }
      ],

      about_section: 'The Bharatiya Janata Party (BJP) is India\'s largest political party, founded in 1980. We are committed to the ideals of integral humanism, cultural nationalism, and positive secularism.',
      mission_statement: 'To build a strong, prosperous, and self-reliant India based on the principles of nationalism, democracy, and good governance.',
      vision_statement: 'A developed India where every citizen has access to opportunities, security, and dignified living.'
    },

    theme_config: {
      header_style: 'gradient',
      footer_style: 'detailed',
      sidebar_style: 'modern',
      card_style: 'elevated',
      border_radius: '8px',
      shadow_level: 'high'
    },

    contact_config: {
      email: 'contact@bjp.org',
      phone: '+91-11-23348888',
      address: '6A, Deen Dayal Upadhyay Marg, New Delhi - 110002',
      support_email: 'support@bjp.pulseofpeople.com',
      support_phone: '+91-11-23348889',
      facebook: 'https://www.facebook.com/BJP4India',
      twitter: 'https://twitter.com/BJP4India',
      instagram: 'https://www.instagram.com/bjp4india',
      youtube: 'https://www.youtube.com/user/BJP',
      linkedin: '',
      whatsapp: '+91-11-23348888'
    },

    party_info: {
      party_name: 'Bharatiya Janata Party',
      party_symbol: 'Lotus',
      founded_date: '1980-04-06',
      leader_name: 'Narendra Modi',
      leader_image: '/images/leaders/modi.jpg',
      ideology: 'Cultural nationalism, Integral humanism, Conservative',
      slogan: 'सबका साथ, सबका विकास, सबका विश्वास',
      manifesto_url: 'https://www.bjp.org/manifesto'
    },

    features_enabled: {
      voter_database: true,
      campaign_management: true,
      sentiment_analysis: true,
      field_reports: true,
      whatsapp_bot: true,
      social_media_monitoring: true,
      analytics_dashboard: true,
      maps: true,
      bulk_upload: true,
      notifications: true,
      api_access: true
    },

    usage_limits: {
      max_users: 100,
      max_storage_gb: 100,
      max_api_calls_per_month: 100000,
      max_sms_per_month: 50000,
      max_email_per_month: 100000,
      max_whatsapp_messages_per_month: 50000
    },

    seo_config: {
      meta_title: 'BJP - Bharatiya Janata Party | Official Campaign Platform',
      meta_description: 'Join the Bharatiya Janata Party in building a New India. Largest political party committed to nationalism, development, and good governance.',
      meta_keywords: 'BJP, Bharatiya Janata Party, Indian Politics, Narendra Modi, Development',
      og_image: '/images/bjp-og.jpg',
      og_title: 'BJP - Building a New India',
      og_description: 'Join us in our mission for development, democracy, and good governance'
    },

    social_media_links: {
      facebook: 'https://www.facebook.com/BJP4India',
      twitter: 'https://twitter.com/BJP4India',
      instagram: 'https://www.instagram.com/bjp4india',
      youtube: 'https://www.youtube.com/user/BJP'
    }
  },

  {
    // TVK - Tamilaga Vettri Kazhagam
    name: 'Tamilaga Vettri Kazhagam',
    slug: 'tvk',
    subdomain: 'tvk',
    logo: '/logos/tvk-logo.png',
    organization_type: 'party',
    contact_email: 'contact@tvk.pulseofpeople.com',
    contact_phone: '+91-44-12345678',
    address: 'Chennai, Tamil Nadu',
    city: 'Chennai',
    state: 'Tamil Nadu',
    website: 'https://www.tvk.org',
    subscription_plan: 'pro',
    subscription_status: 'active',
    max_users: 50,
    is_active: true,
    is_public: true,
    allow_registration: true,
    domain_verified: false,

    branding: {
      logo_url: '/logos/tvk-logo.png',
      favicon_url: '/logos/tvk-favicon.ico',
      primary_color: '#FFD700', // Gold
      secondary_color: '#FF0000', // Red
      accent_color: '#1976D2', // Blue
      text_color: '#212121',
      background_color: '#FFFFFF',
      header_bg_color: '#FFD700',
      footer_bg_color: '#1C1C1C',
      button_bg_color: '#FFD700',
      button_hover_color: '#FFC700',
      font_family: 'Roboto, sans-serif',
      logo_width: '200px',
      logo_height: '60px'
    },

    landing_page_config: {
      hero_title: 'தமிழகத்தின் வெற்றிக் கழகம்',
      hero_subtitle: 'For Tamil Pride, Progress, and Prosperity',
      hero_image: '/images/tvk-hero.jpg',
      hero_cta_text: 'Join TVK',
      hero_cta_url: '/register',
      hero_secondary_cta_text: 'Our Ideology',
      hero_secondary_cta_url: '/about',

      features: [
        {
          icon: 'school',
          title: 'Quality Education',
          description: 'Free quality education for all Tamil students from school to university'
        },
        {
          icon: 'health_and_safety',
          title: 'Healthcare Access',
          description: 'Universal healthcare coverage for every Tamil Nadu citizen'
        },
        {
          icon: 'work',
          title: 'Employment Generation',
          description: 'Creating 1 million jobs through industrialization and skill development'
        },
        {
          icon: 'agriculture',
          title: 'Farmer Welfare',
          description: 'Fair prices, loan waivers, and modern agricultural support'
        }
      ],

      stats: [
        { label: 'Party Members', value: '10 Lakh+', icon: 'people' },
        { label: 'Districts Covered', value: '38', icon: 'map' },
        { label: 'Social Programs', value: '25+', icon: 'volunteer_activism' },
        { label: 'Youth Volunteers', value: '5 Lakh+', icon: 'groups' }
      ],

      testimonials: [
        {
          name: 'Vijay',
          role: 'Thalapathy & TVK Leader',
          image: '/images/leaders/vijay.jpg',
          quote: 'தமிழ் மக்களின் நலனே எங்கள் முதல் குறிக்கோள். நீதியான, வளமான தமிழகம் உருவாக்குவோம்.'
        }
      ],

      about_section: 'Tamilaga Vettri Kazhagam (TVK) is a Tamil Nadu-based political party dedicated to the welfare, rights, and prosperity of Tamil people. Founded with the vision of creating a progressive Tamil Nadu.',
      mission_statement: 'To serve the Tamil people with honesty, transparency, and dedication, ensuring equitable development across all sections of society.',
      vision_statement: 'A prosperous, educated, and self-reliant Tamil Nadu where every citizen lives with dignity, opportunity, and pride.'
    },

    theme_config: {
      header_style: 'modern',
      footer_style: 'detailed',
      sidebar_style: 'modern',
      card_style: 'elevated',
      border_radius: '12px',
      shadow_level: 'medium'
    },

    contact_config: {
      email: 'contact@tvk.org',
      phone: '+91-44-12345678',
      address: 'Chennai, Tamil Nadu - 600001',
      support_email: 'support@tvk.pulseofpeople.com',
      support_phone: '+91-44-12345679',
      facebook: 'https://www.facebook.com/TVKOfficial',
      twitter: 'https://twitter.com/TVKOfficial',
      instagram: 'https://www.instagram.com/tvkofficial',
      youtube: 'https://www.youtube.com/c/TVKOfficial',
      linkedin: '',
      whatsapp: '+91-44-12345678'
    },

    party_info: {
      party_name: 'Tamilaga Vettri Kazhagam',
      party_symbol: 'Flag',
      founded_date: '2024-02-02',
      leader_name: 'Vijay',
      leader_image: '/images/leaders/vijay.jpg',
      ideology: 'Tamil nationalism, Social democracy, Progressive',
      slogan: 'தமிழகத்தின் வெற்றி, தமிழரின் வாழ்வு',
      manifesto_url: 'https://www.tvk.org/manifesto'
    },

    features_enabled: {
      voter_database: true,
      campaign_management: true,
      sentiment_analysis: true,
      field_reports: true,
      whatsapp_bot: true,
      social_media_monitoring: true,
      analytics_dashboard: true,
      maps: true,
      bulk_upload: true,
      notifications: true,
      api_access: true
    },

    usage_limits: {
      max_users: 50,
      max_storage_gb: 50,
      max_api_calls_per_month: 50000,
      max_sms_per_month: 25000,
      max_email_per_month: 50000,
      max_whatsapp_messages_per_month: 25000
    },

    seo_config: {
      meta_title: 'TVK - Tamilaga Vettri Kazhagam | Official Campaign Platform',
      meta_description: 'Join Tamilaga Vettri Kazhagam in building a progressive Tamil Nadu. Dedicated to Tamil pride, people\'s welfare, and equitable development.',
      meta_keywords: 'TVK, Tamilaga Vettri Kazhagam, Tamil Nadu Politics, Vijay, Tamil Pride',
      og_image: '/images/tvk-og.jpg',
      og_title: 'TVK - Tamil Nadu\'s Victory Party',
      og_description: 'For Tamil pride, progress, and prosperity'
    },

    social_media_links: {
      facebook: 'https://www.facebook.com/TVKOfficial',
      twitter: 'https://twitter.com/TVKOfficial',
      instagram: 'https://www.instagram.com/tvkofficial',
      youtube: 'https://www.youtube.com/c/TVKOfficial'
    }
  },

  {
    // Demo tenant for testing
    name: 'Demo Organization',
    slug: 'demo',
    subdomain: 'demo',
    logo: '/logos/demo-logo.png',
    organization_type: 'campaign',
    contact_email: 'demo@pulseofpeople.com',
    contact_phone: '+91-11-00000000',
    address: 'Demo Address',
    city: 'Demo City',
    state: 'Demo State',
    website: 'https://demo.pulseofpeople.com',
    subscription_plan: 'free',
    subscription_status: 'active',
    max_users: 5,
    is_active: true,
    is_public: true,
    allow_registration: true,
    domain_verified: false,

    branding: {
      logo_url: '/logos/demo-logo.png',
      favicon_url: '/logos/demo-favicon.ico',
      primary_color: '#1976D2',
      secondary_color: '#424242',
      accent_color: '#FF9800',
      text_color: '#212121',
      background_color: '#FFFFFF',
      header_bg_color: '#1976D2',
      footer_bg_color: '#424242',
      button_bg_color: '#1976D2',
      button_hover_color: '#1565C0',
      font_family: 'Roboto, sans-serif',
      logo_width: '200px',
      logo_height: '60px'
    },

    landing_page_config: {
      hero_title: 'Demo Campaign Platform',
      hero_subtitle: 'Test Drive Our Political Campaign Management System',
      hero_image: '/images/demo-hero.jpg',
      hero_cta_text: 'Try Demo',
      hero_cta_url: '/register',
      hero_secondary_cta_text: 'Learn More',
      hero_secondary_cta_url: '/about',
      features: [],
      testimonials: [],
      stats: [],
      about_section: 'This is a demo tenant for testing purposes.',
      mission_statement: 'To demonstrate the capabilities of our multi-tenant platform.',
      vision_statement: 'A showcase of possibilities for political campaigns.'
    },

    theme_config: {
      header_style: 'standard',
      footer_style: 'minimal',
      sidebar_style: 'minimal',
      card_style: 'outlined',
      border_radius: '4px',
      shadow_level: 'low'
    },

    contact_config: {
      email: 'demo@pulseofpeople.com',
      phone: '+91-11-00000000',
      address: 'Demo Address',
      support_email: 'support@pulseofpeople.com',
      support_phone: '+91-11-00000001',
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
      whatsapp: ''
    },

    party_info: {
      party_name: 'Demo Party',
      party_symbol: 'Star',
      founded_date: '2025-01-01',
      leader_name: 'Demo Leader',
      leader_image: '',
      ideology: 'Demo',
      slogan: 'Test the Platform',
      manifesto_url: ''
    },

    features_enabled: {
      voter_database: true,
      campaign_management: true,
      sentiment_analysis: false,
      field_reports: true,
      whatsapp_bot: false,
      social_media_monitoring: false,
      analytics_dashboard: true,
      maps: true,
      bulk_upload: false,
      notifications: true,
      api_access: false
    },

    usage_limits: {
      max_users: 5,
      max_storage_gb: 1,
      max_api_calls_per_month: 1000,
      max_sms_per_month: 100,
      max_email_per_month: 500,
      max_whatsapp_messages_per_month: 100
    },

    seo_config: {
      meta_title: 'Demo - Political Campaign Platform',
      meta_description: 'Demo tenant for testing multi-tenant features',
      meta_keywords: 'demo, testing',
      og_image: '',
      og_title: 'Demo Platform',
      og_description: 'Test our platform'
    },

    social_media_links: {}
  }
]

// =====================================================
// SEED FUNCTION
// =====================================================

async function seedTenants() {
  console.log('🌱 Starting tenant data seeding...\n')

  try {
    for (const tenant of tenantConfigurations) {
      console.log(`📦 Creating tenant: ${tenant.name} (${tenant.subdomain})`)

      // Check if tenant already exists
      const { data: existing, error: checkError } = await supabase
        .from('organizations')
        .select('id, subdomain')
        .eq('subdomain', tenant.subdomain)
        .single()

      if (existing) {
        console.log(`   ⚠️  Tenant '${tenant.subdomain}' already exists. Updating...`)

        const { data: updated, error: updateError } = await supabase
          .from('organizations')
          .update(tenant)
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) {
          console.error(`   ❌ Error updating tenant '${tenant.subdomain}':`, updateError.message)
          continue
        }

        console.log(`   ✅ Updated tenant: ${tenant.name}`)
      } else {
        // Insert new tenant
        const { data: inserted, error: insertError } = await supabase
          .from('organizations')
          .insert(tenant)
          .select()
          .single()

        if (insertError) {
          console.error(`   ❌ Error creating tenant '${tenant.subdomain}':`, insertError.message)
          continue
        }

        console.log(`   ✅ Created tenant: ${tenant.name}`)
      }

      console.log(`   🌐 Access URL: http://${tenant.subdomain}.localhost:5173\n`)
    }

    console.log('\n✨ Tenant seeding completed successfully!\n')
    console.log('📍 Test URLs:')
    tenantConfigurations.forEach(tenant => {
      console.log(`   - http://${tenant.subdomain}.localhost:5173 (${tenant.name})`)
    })
    console.log('')

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error)
    process.exit(1)
  }
}

// =====================================================
// RUN SEED
// =====================================================

seedTenants()
  .then(() => {
    console.log('✅ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
