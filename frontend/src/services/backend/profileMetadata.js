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
    return {
      aboutMe: 'I am a highly motivated engineer who enjoys building scalable web architectures and leading engineering teams to deliver state-of-the-art products.',
      loveAboutJob: 'I love collaborating with brilliant minds, solving complex architectural challenges, and seeing Dayflow align everyone’s day perfectly.',
      hobbies: 'Hiking, playing guitar, sketching, and playing chess.',
      skills: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB'],
      certifications: [
        { name: 'AWS Certified Solutions Architect', authority: 'Amazon Web Services', date: '2024-05-12' },
        { name: 'Certified ScrumMaster (CSM)', authority: 'Scrum Alliance', date: '2023-09-20' }
      ],
      dob: '1995-04-20',
      nationality: 'Indian',
      personalEmail: 'marcus.personal@gmail.com',
      gender: 'Male',
      maritalStatus: 'Single',
      bankAccountNumber: '918273645510',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0001234',
      panNumber: 'ABCDE1234F',
      uanNumber: '100998877665',
      employeeCode: empId,
      monthlyWage: 75000
    };
  }
};
