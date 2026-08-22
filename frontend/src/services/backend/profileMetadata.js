/**
 * Local Storage database for extended profile information (Resume, Skills, Certifications, Bank info, Hobbies).
 */
export const profileMetadataService = {
  getMetadata(empId) {
    if (!empId) return this.getDefaultData('SYSTEM-USER');
    
    const key = `dayflow_profile_metadata_${empId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse metadata, resetting:", e);
      }
    }

    const defaultData = this.getDefaultData(empId);
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  },

  saveMetadata(empId, data) {
    if (!empId) return;
    const key = `dayflow_profile_metadata_${empId}`;
    localStorage.setItem(key, JSON.stringify(data));
  },

  getDefaultData(empId) {
    const MOCK_PROFILES = {
      'OIELMO20260002': {
        aboutMe: 'Passionate about crafting pixel-perfect, responsive UI experiences and building performant React applications.',
        loveAboutJob: 'Creating beautiful layouts, writing clean frontend code, and building modular component libraries.',
        hobbies: 'Photography, coffee brewing, UI design, and cycling.',
        skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Vite', 'Redux Toolkit', 'Jest'],
        certifications: [
          { name: 'Meta Front-End Developer Professional Certificate', authority: 'Coursera / Meta', date: '2024-02-15' },
          { name: 'React Nanodegree', authority: 'Udacity', date: '2023-07-10' }
        ],
        dob: '1996-08-14',
        nationality: 'Indian',
        personalEmail: 'eleanor.morgan.personal@gmail.com',
        gender: 'Female',
        maritalStatus: 'Single',
        bankAccountNumber: '501004928172',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0000012',
        panNumber: 'ELNMR1001M',
        uanNumber: '101234567890',
        monthlyWage: 85000
      },
      'OIMACH20260003': {
        aboutMe: 'Dedicated HR professional focused on building inclusive work environments, streamlining recruitment pipelines, and optimizing personnel management.',
        loveAboutJob: 'Empowering employees, resolving workplace queries, and driving organizational success.',
        hobbies: 'Reading history books, playing tennis, volunteering, and public speaking.',
        skills: ['HR Operations', 'Conflict Resolution', 'Strategic Staffing', 'Employee Relations', 'ATS'],
        certifications: [
          { name: 'SHRM Certified Professional (SHRM-CP)', authority: 'SHRM', date: '2024-01-20' }
        ],
        dob: '1992-11-05',
        nationality: 'Indian',
        personalEmail: 'marcus.chen.personal@gmail.com',
        gender: 'Male',
        maritalStatus: 'Married',
        bankAccountNumber: '918273645510',
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001234',
        panNumber: 'MRCCH1002N',
        uanNumber: '100998877665',
        monthlyWage: 72000
      },
      'OIALVA20260005': {
        aboutMe: 'Executive HR professional with over 10 years of experience shaping workplace culture, leading diversity initiatives, and designing corporate policies.',
        loveAboutJob: 'Designing long-term HR strategy, aligning workforce intelligence, and mentoring team leads.',
        hobbies: 'Playing chess, writing newsletters, organic gardening, and running marathons.',
        skills: ['Executive Leadership', 'Corporate Governance', 'Talent Strategy', 'Succession Planning'],
        certifications: [
          { name: 'Senior Professional in Human Resources (SPHR)', authority: 'HRCI', date: '2022-10-15' }
        ],
        dob: '1988-03-22',
        nationality: 'Indian',
        personalEmail: 'alexandra.vance.personal@gmail.com',
        gender: 'Female',
        maritalStatus: 'Married',
        bankAccountNumber: '204928172635',
        bankName: 'ICICI Bank',
        ifscCode: 'ICIC0000102',
        panNumber: 'ALXVC1003P',
        uanNumber: '100554433221',
        monthlyWage: 130000
      },
      'OIEMUS20260001': {
        aboutMe: 'Associate specialist representing general operations and product delivery workflows.',
        loveAboutJob: 'Learning new tech stacks and delivering high quality product features on time.',
        hobbies: 'Gaming, reading Sci-Fi, and baking.',
        skills: ['JavaScript', 'React', 'Node.js'],
        certifications: [],
        dob: '1997-05-18',
        nationality: 'Indian',
        personalEmail: 'employee.user@gmail.com',
        gender: 'Male',
        maritalStatus: 'Single',
        bankAccountNumber: '492810293847',
        bankName: 'Axis Bank',
        ifscCode: 'UTIB0000242',
        panNumber: 'EMPUS2026A',
        uanNumber: '100112233445',
        monthlyWage: 60000
      }
    };

    if (MOCK_PROFILES[empId]) {
      return {
        ...MOCK_PROFILES[empId],
        employeeCode: empId
      };
    }

    // Dynamically generate unique defaults based on employee ID so it is not a duplicate of others!
    const numId = empId ? empId.replace(/\D/g, '') || '9999' : '9999';
    return {
      aboutMe: `Associate specialist representing workforce identity ${empId || 'new'}. Dedicated to project excellence and dynamic workspace alignment at Dayflow.`,
      loveAboutJob: 'Solving daily tasks and collaborating with teammates.',
      hobbies: 'Traveling, listening to podcasts, and reading.',
      skills: ['Office Productivity', 'Project Support', 'Communication'],
      certifications: [],
      dob: '1997-01-01',
      nationality: 'Indian',
      personalEmail: `user.${numId}@personal.com`,
      gender: 'Male',
      maritalStatus: 'Single',
      bankAccountNumber: `10000000${numId}`.slice(-12),
      bankName: 'Axis Bank',
      ifscCode: 'UTIB0000242',
      panNumber: `ABCDE${numId}F`.slice(0, 10).toUpperCase(),
      uanNumber: `1000000000${numId}`.slice(-12),
      employeeCode: empId,
      monthlyWage: 65000
    };
  }
};

// Named alias so files can import either `profileMetadata` or `profileMetadataService`
export const profileMetadata = profileMetadataService;
