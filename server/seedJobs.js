// TEST DATA SEEDER
// Run this script to populate your database with sample jobs for testing
// Usage: node seedJobs.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Simple Job schema for seeding
const jobSchema = new mongoose.Schema({
  company: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  location: String,
  type: String,
  experienceLevel: String,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  skills: [String],
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  remote: Boolean,
  status: {
    type: String,
    default: 'active'
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  postedDate: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('Job', jobSchema);

// Sample company ID - Replace with an actual company ID from your database
// You can get this by creating a company account first
const SAMPLE_COMPANY_ID = '000000000000000000000001'; // Replace this!

const sampleJobs = [
  {
    title: 'Frontend Developer',
    description: 'We are looking for a talented Frontend Developer to join our team. You will work on building responsive web applications using React and modern JavaScript.',
    location: 'New York, NY',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD'
    },
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Redux'],
    requirements: [
      '3+ years of experience with React',
      'Strong understanding of JavaScript ES6+',
      'Experience with state management (Redux/Context)',
      'Knowledge of responsive design principles',
      'Excellent problem-solving skills'
    ],
    responsibilities: [
      'Build and maintain frontend applications',
      'Collaborate with designers and backend developers',
      'Write clean, maintainable code',
      'Participate in code reviews',
      'Optimize application performance'
    ],
    benefits: ['Health Insurance', '401k', 'Remote Work', 'Paid Time Off'],
    remote: true
  },
  {
    title: 'Backend Engineer',
    description: 'Join our backend team to build scalable APIs and microservices. Experience with Node.js and databases required.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    experienceLevel: 'Senior Level',
    salary: {
      min: 120000,
      max: 160000,
      currency: 'USD'
    },
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
    requirements: [
      '5+ years backend development experience',
      'Strong knowledge of Node.js and Express',
      'Experience with database design',
      'Understanding of microservices architecture',
      'DevOps experience preferred'
    ],
    responsibilities: [
      'Design and implement RESTful APIs',
      'Optimize database queries and performance',
      'Deploy and maintain services on cloud platforms',
      'Mentor junior developers',
      'Participate in architecture decisions'
    ],
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Learning Budget'],
    remote: true
  },
  {
    title: 'Full Stack Developer',
    description: 'Looking for a versatile Full Stack Developer comfortable with both frontend and backend technologies.',
    location: 'Austin, TX',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    salary: {
      min: 90000,
      max: 130000,
      currency: 'USD'
    },
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'Git'],
    requirements: [
      '3+ years full stack development',
      'Experience with MERN stack',
      'Strong communication skills',
      'Ability to work independently',
      'Experience with Agile methodologies'
    ],
    responsibilities: [
      'Develop features across the entire stack',
      'Write unit and integration tests',
      'Collaborate with product team',
      'Debug and fix issues',
      'Document technical processes'
    ],
    benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work', 'Team Events'],
    remote: false
  },
  {
    title: 'Software Engineering Intern',
    description: 'Great opportunity for students to gain real-world experience in software development.',
    location: 'Boston, MA',
    type: 'Internship',
    experienceLevel: 'Entry Level',
    salary: {
      min: 25,
      max: 35,
      currency: 'USD'
    },
    skills: ['Python', 'JavaScript', 'Git', 'SQL'],
    requirements: [
      'Currently pursuing Computer Science degree',
      'Basic programming knowledge',
      'Enthusiasm to learn',
      'Good problem-solving skills',
      'Available for 3-month internship'
    ],
    responsibilities: [
      'Work on real projects under mentorship',
      'Write and test code',
      'Participate in team meetings',
      'Learn best practices',
      'Contribute to documentation'
    ],
    benefits: ['Mentorship', 'Learning Opportunities', 'Networking', 'Potential Full-time Offer'],
    remote: false
  },
  {
    title: 'DevOps Engineer',
    description: 'We need a DevOps Engineer to help us maintain and improve our infrastructure and deployment pipelines.',
    location: 'Seattle, WA',
    type: 'Full-time',
    experienceLevel: 'Senior Level',
    salary: {
      min: 130000,
      max: 170000,
      currency: 'USD'
    },
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Python'],
    requirements: [
      '5+ years DevOps experience',
      'Strong knowledge of AWS services',
      'Experience with containerization',
      'Proficiency in scripting',
      'Experience with monitoring tools'
    ],
    responsibilities: [
      'Manage cloud infrastructure',
      'Build and maintain CI/CD pipelines',
      'Monitor system performance',
      'Automate deployment processes',
      'Ensure system security and reliability'
    ],
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Conference Budget'],
    remote: true
  },
  {
    title: 'Mobile App Developer (React Native)',
    description: 'Build cross-platform mobile applications for iOS and Android using React Native.',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    salary: {
      min: 95000,
      max: 135000,
      currency: 'USD'
    },
    skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Redux', 'REST APIs'],
    requirements: [
      '3+ years React Native development',
      'Published apps on App Store and Play Store',
      'Understanding of mobile design patterns',
      'Experience with native modules',
      'Knowledge of mobile app security'
    ],
    responsibilities: [
      'Develop and maintain mobile applications',
      'Optimize app performance',
      'Work with backend APIs',
      'Debug issues across platforms',
      'Implement new features'
    ],
    benefits: ['Health Insurance', '401k', 'Flexible Hours', 'Phone Allowance'],
    remote: true
  },
  {
    title: 'UI/UX Designer',
    description: 'Creative UI/UX Designer needed to create beautiful and intuitive user interfaces.',
    location: 'Chicago, IL',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    salary: {
      min: 75000,
      max: 105000,
      currency: 'USD'
    },
    skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping', 'HTML/CSS'],
    requirements: [
      '3+ years UI/UX design experience',
      'Strong portfolio',
      'Experience with design systems',
      'Understanding of accessibility',
      'Excellent communication skills'
    ],
    responsibilities: [
      'Design user interfaces and experiences',
      'Create wireframes and prototypes',
      'Conduct user research and testing',
      'Collaborate with developers',
      'Maintain design systems'
    ],
    benefits: ['Health Insurance', 'Design Software Licenses', 'Remote Work', 'Creative Freedom'],
    remote: true
  },
  {
    title: 'Data Analyst',
    description: 'Analyze data to help drive business decisions. Experience with SQL and data visualization tools required.',
    location: 'Miami, FL',
    type: 'Full-time',
    experienceLevel: 'Entry Level',
    salary: {
      min: 60000,
      max: 85000,
      currency: 'USD'
    },
    skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Data Visualization', 'Statistics'],
    requirements: [
      '1-2 years data analysis experience',
      'Strong SQL skills',
      'Experience with visualization tools',
      'Statistical knowledge',
      'Attention to detail'
    ],
    responsibilities: [
      'Analyze business data',
      'Create reports and dashboards',
      'Identify trends and insights',
      'Present findings to stakeholders',
      'Maintain data quality'
    ],
    benefits: ['Health Insurance', 'Professional Development', 'Hybrid Work', 'Bonus Potential'],
    remote: false
  }
];

async function seedJobs() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/joblink';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing jobs (optional - comment out if you don't want to clear)
    // await Job.deleteMany({});
    // console.log('🗑️  Cleared existing jobs');

    // Add company ID to each job
    const jobsWithCompany = sampleJobs.map(job => ({
      ...job,
      company: SAMPLE_COMPANY_ID
    }));

    // Insert jobs
    const inserted = await Job.insertMany(jobsWithCompany);
    console.log(`✅ Inserted ${inserted.length} sample jobs`);

    // Display summary
    console.log('\n📊 Job Summary:');
    console.log(`- Remote Jobs: ${inserted.filter(j => j.remote).length}`);
    console.log(`- Full-time: ${inserted.filter(j => j.type === 'Full-time').length}`);
    console.log(`- Entry Level: ${inserted.filter(j => j.experienceLevel === 'Entry Level').length}`);
    console.log(`- Mid Level: ${inserted.filter(j => j.experienceLevel === 'Mid Level').length}`);
    console.log(`- Senior Level: ${inserted.filter(j => j.experienceLevel === 'Senior Level').length}`);

    console.log('\n✨ Done! Your database now has sample jobs for testing.');
    console.log('\n⚠️  IMPORTANT: Update SAMPLE_COMPANY_ID with a real company ID from your database!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedJobs();