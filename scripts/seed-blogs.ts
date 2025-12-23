import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Blog Schema (inline to avoid import issues)
const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    coverImage: { type: String, default: null },
    authorTag: { type: String, required: true },
    authorName: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    readTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) + '-' + Date.now().toString(36);
}

// Calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

const blogs = [
  {
    title: "Understanding Anxiety: What It Is and How to Cope",
    content: `# Understanding Anxiety: What It Is and How to Cope

Anxiety is one of the most common mental health experiences worldwide. If you've ever felt your heart race before a big presentation, or found yourself worrying endlessly about the future, you've experienced anxiety.

## What is Anxiety?

Anxiety is your body's natural response to stress. It's a feeling of fear or apprehension about what's to come. While occasional anxiety is normal, persistent anxiety that interferes with daily life may indicate an anxiety disorder.

## Common Signs of Anxiety

- Racing thoughts that won't quiet down
- Physical symptoms like rapid heartbeat, sweating, or trembling
- Difficulty concentrating
- Sleep problems
- Avoiding situations that trigger worry

## Coping Strategies That Work

### 1. The 5-4-3-2-1 Grounding Technique

When anxiety strikes, ground yourself by naming:
- **5** things you can see
- **4** things you can touch
- **3** things you can hear
- **2** things you can smell
- **1** thing you can taste

### 2. Box Breathing

Breathe in for 4 counts, hold for 4 counts, breathe out for 4 counts, hold for 4 counts. Repeat.

### 3. Challenge Your Thoughts

Ask yourself: "Is this worry based on facts or fears?" Often, our anxious thoughts are predictions, not realities.

## Remember

Anxiety doesn't define you. It's something you experience, not who you are. With the right tools and support, you can learn to manage anxiety and live a fulfilling life.

*If anxiety is significantly impacting your daily life, please reach out to a mental health professional.*`,
    excerpt: "Anxiety is your body's natural response to stress. Learn what it is, recognize the signs, and discover coping strategies like grounding techniques and box breathing.",
    tags: ["Anxiety", "Coping", "Mental Health", "Self-Help"],
  },
  {
    title: "The Power of Journaling for Mental Health",
    content: `# The Power of Journaling for Mental Health

Sometimes the heaviest things we carry are our unspoken thoughts. Journaling offers a simple yet powerful way to lighten that load.

## Why Journaling Works

Writing about your thoughts and feelings has been scientifically proven to:

- **Reduce stress** by externalizing worries
- **Process emotions** more effectively
- **Identify patterns** in your thoughts and behaviors
- **Boost immune function** (yes, really!)
- **Improve sleep** when done before bed

## How to Start

You don't need fancy notebooks or perfect grammar. Here's how to begin:

### 1. Start Small

Commit to just 5 minutes a day. That's it. You can always write more if you want to.

### 2. Use Prompts

If staring at a blank page feels overwhelming, try these:
- "Today I feel..."
- "Something I'm grateful for is..."
- "A challenge I'm facing is..."
- "I wish someone understood that..."

### 3. Don't Edit Yourself

This is for your eyes only. Let the words flow without judgment.

## Types of Journaling

- **Gratitude journaling**: List 3 things you're grateful for daily
- **Stream of consciousness**: Write whatever comes to mind
- **Mood tracking**: Note your emotions and what triggered them
- **Letter writing**: Write letters to yourself, past or future

## The Athena Approach

Here on Athena, your journal is completely private. Only you can see it. And sometimes, Athena will leave you a supportive note — like a friend who gets it.

*Your words matter. Your feelings matter. Start writing them down.*`,
    excerpt: "Journaling is a simple yet powerful tool for mental health. Learn why it works, how to start, and different approaches to make it a daily practice.",
    tags: ["Journaling", "Self-Care", "Mental Health", "Wellness"],
  },
  {
    title: "Breaking the Silence: Mental Health Stigma in Collectivist Cultures",
    content: `# Breaking the Silence: Mental Health Stigma in Collectivist Cultures

In many cultures around the world, mental health remains a whispered topic — if it's discussed at all. This silence costs lives.

## The Weight of "What Will People Say?"

In collectivist cultures — across South Asia, East Asia, the Middle East, and many African and Latin American communities — individual identity is deeply tied to family honor. Mental health struggles are often seen as:

- A sign of weakness
- A family shame to be hidden
- A character flaw rather than a health issue
- Something that will hurt marriage prospects

## The Real Cost

This stigma has devastating consequences:

- **75% of people** with mental health conditions in developing countries receive no treatment
- Many suffer in silence for years before seeking help
- Suicide rates are disproportionately high in stigmatized communities
- Physical symptoms are treated while psychological causes are ignored

## Changing the Narrative

### 1. Language Matters

Instead of saying someone "is depressed," say they're "experiencing depression." It's something you have, not who you are.

### 2. Share Stories

When public figures, family members, or friends share their mental health journeys, it normalizes the conversation.

### 3. Educate Gently

Many stigmas come from misunderstanding. Share information without judgment.

### 4. Create Safe Spaces

Sometimes people need anonymous spaces to express themselves first. That's why platforms like Athena exist.

## You Are Not Alone

If you're reading this from a culture where mental health is taboo, know this: your struggle is valid. Seeking help is brave, not weak. And there are communities — like this one — where you can be honest without fear.

*The silence ends with us.*`,
    excerpt: "Mental health stigma in collectivist cultures costs lives. Learn about the challenges faced by those who can't openly seek help, and how we can change the narrative.",
    tags: ["Stigma", "Culture", "Mental Health", "Community"],
  },
  {
    title: "Why Celebrating Small Wins Matters for Mental Health",
    content: `# Why Celebrating Small Wins Matters for Mental Health

Got out of bed today? That counts. Replied to that message you've been avoiding? Victory. Ate a real meal? Flex.

## The Science of Small Wins

When you acknowledge a small achievement, your brain releases dopamine — the "feel good" neurotransmitter. This creates a positive feedback loop:

1. You accomplish something small
2. You acknowledge it
3. Dopamine releases
4. You feel motivated to do more
5. Repeat

## Why We Dismiss Our Wins

Society often teaches us that only "big" achievements matter:
- Got a promotion? Celebrate!
- Managed to shower during a depressive episode? "That's just basic."

But here's the truth: **during hard times, basic things require extraordinary effort.** Getting through the day IS an achievement.

## How to Practice Celebrating

### 1. Lower the Bar (Seriously)

Your wins don't need to impress anyone. They just need to be real.

### 2. Say It Out Loud

Tell someone, write it down, or post it here. Externalizing achievements makes them feel more real.

### 3. Feel It in Your Body

Do a little dance. Pump your fist. Let your body experience the win.

### 4. Stack Your Wins

Keep a list. When you're feeling low, read it back.

## The Athena "Flex" Mode

That's exactly why we built Flex mode. A space to share your wins — big or small — and have Athena and the community celebrate with you.

Because every step forward deserves recognition. Yes, even that one.

*What's your win today?*`,
    excerpt: "Small wins matter more than we think. Learn why celebrating everyday achievements boosts mental health and how to make it a practice.",
    tags: ["Self-Care", "Positivity", "Mental Health", "Growth"],
  },
  {
    title: "Breathe Through It: Simple Techniques for Instant Calm",
    content: `# Breathe Through It: Simple Techniques for Instant Calm

Your breath is the remote control for your nervous system. Here's how to use it.

## Why Breathing Works

When you're anxious or stressed, your sympathetic nervous system (fight-or-flight) activates. Your breath becomes shallow and rapid.

By consciously slowing your breath, you activate the parasympathetic nervous system (rest-and-digest), telling your body: "We're safe."

## Technique 1: Box Breathing (4-4-4-4)

Used by Navy SEALs to stay calm under pressure.

1. **Inhale** for 4 seconds
2. **Hold** for 4 seconds
3. **Exhale** for 4 seconds
4. **Hold** for 4 seconds
5. Repeat 4 times

## Technique 2: 4-7-8 Breathing

Perfect for sleep and deep relaxation.

1. **Inhale** through nose for 4 seconds
2. **Hold** for 7 seconds
3. **Exhale** through mouth for 8 seconds
4. Repeat 3-4 times

## Technique 3: Physiological Sigh

The fastest way to calm down (backed by Stanford research).

1. Take a deep breath in through your nose
2. At the top, take a second quick inhale to fully expand lungs
3. Long, slow exhale through your mouth
4. One cycle is often enough!

## When to Use These

- Before a stressful event
- During a panic attack
- When you can't sleep
- In moments of anger
- Anytime you need to reset

## Try It Now

Head to the **Breathe** section here on Athena. We've built an animated breathing guide that makes this practice easy and beautiful.

Your calm is just a few breaths away.

*Breathe in. Breathe out. You've got this.*`,
    excerpt: "Your breath is the remote control for your nervous system. Learn Box Breathing, 4-7-8 technique, and the Physiological Sigh for instant calm.",
    tags: ["Breathing", "Anxiety", "Self-Care", "Techniques"],
  },
];

async function seedBlogs() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📝 Seeding blogs...\n');

    for (const blogData of blogs) {
      const slug = generateSlug(blogData.title);
      const readTime = calculateReadTime(blogData.content);

      const existingBlog = await Blog.findOne({ title: blogData.title });
      if (existingBlog) {
        console.log(`⏭️  Skipping "${blogData.title}" (already exists)`);
        continue;
      }

      const blog = await Blog.create({
        ...blogData,
        slug,
        readTime,
        authorTag: 'athena#0000',
        authorName: 'Athena',
        isPublished: true,
        publishedAt: new Date(),
      });

      console.log(`✅ Created: "${blog.title}"`);
    }

    console.log('\n🎉 Blog seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedBlogs();

