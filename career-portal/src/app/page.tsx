'use client';
import { useState, FormEvent } from 'react';

import { projectId, publicAnonKey } from '@/app/utils/supabase/info';

const logo = '/yayasan-nusantara-sejati.png';


export default function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    motivation: '',
    skills: [] as string[],
    address: '',
    domicile: '',
    education: '',
    availability: '',
    heardFrom: '',

  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) {
      const { name } = e.target;
      if (name === 'cv') {
        setCvFile(e.target.files[0]);
      } else if (name === 'portfolio') {
        setPortfolioFile(e.target.files[0]);
      }

    }

  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      let cvUrl = '';
      let portfolioUrl = '';

      // 1. Upload CV ke Storage
      if (cvFile) {
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await fetch(
          `https://${projectId}.supabase.co/storage/v1/object/applications/${filePath}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'apikey': publicAnonKey,
              'Content-Type': cvFile.type
            },
            body: cvFile
          }
        ).then(res => res.json());

        if (uploadError) throw new Error('Gagal mengunggah CV');
        cvUrl = filePath;
      }

      // 2. Kirim Data Form ke Tabel "Kandidat"
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        experience: formData.experience,
        motivation: formData.motivation,
        skills: formData.skills.join(', '),
        address: formData.address,
        domicile: formData.domicile,
        education: formData.education,
        availability: formData.availability,
        heard_from: formData.heardFrom,
        cv_url: cvUrl
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/rest/v1/Kandidat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengirim lamaran');
      }

      setSubmitStatus('success');
      // Reset form
      setFormData({
        fullName: '', email: '', phone: '', position: '', experience: '',
        motivation: '', skills: [], address: '', domicile: '',
        education: '', availability: '', heardFrom: ''
      });
      setCvFile(null);

    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (

    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Company Logo" className="h-28 w-auto" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">Career Opportunities</h1>
          <p className="text-lg text-gray-600">Submit your application and we'll be in touch soon</p>

        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />

              </svg>

              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-900">Application Submitted Successfully!</h3>
                <p className="mt-1 text-green-700">Thank you for applying. We've received your application and will review it shortly.</p>

              </div>

            </div>

          </div>

        )}


        {/* Error Message */}

        {submitStatus === 'error' && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>

              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-900">Submission Failed</h3>
                <p className="mt-1 text-red-700">{errorMessage}</p>

              </div>

            </div>

          </div>

        )}



        {/* Application Form */}

        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-8 space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="John Doe"
            />

          </div>

          {/* Email Address */}

          <div>

            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
             name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="john.doe@example.com"

            />

          </div>

          {/* Phone Number */}

          <div>

            <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>

            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="+1 234 567 8900"

            />

          </div>

          {/* Position Applied For */}

          <div>

            <label htmlFor="position" className="block text-sm font-medium text-gray-900 mb-2">
              Position Applied For <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"

              placeholder="e.g., Software Engineer, Marketing Manager"

            />

          </div>

          {/* Years of Experience */}

          <div>

            <label htmlFor="experience" className="block text-sm font-medium text-gray-900 mb-2">
              Years of Experience <span className="text-red-500">*</span>

            </label>
            <select

              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}

              required

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"

            >

              <option value="">Select years of experience</option>

              <option value="Fresh Graduate">Fresh Graduate</option>

              <option value="< 1 year">&lt; 1 year</option>

              <option value="1-2 years">1-2 years</option>

              <option value="3-5 years">3-5 years</option>

              <option value="6-10 years">6-10 years</option>

              <option value="> 10 years">&gt; 10 years</option>

            </select>

          </div>

          {/* Motivation */}

          <div>

            <label htmlFor="motivation" className="block text-sm font-medium text-gray-900 mb-2">
              Motivation <span className="text-red-500">*</span>
            </label>

            <textarea

              id="motivation"

              name="motivation"

              value={formData.motivation}

              onChange={handleInputChange}

              required

              rows={3}

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"

              placeholder="Explain why you are applying for this position and how your experience or skills make you a suitable candidate (max 200 words)."

            />

          </div>

          {/* Skills */}
          <div>
  <label className="block text-sm font-medium text-gray-900 mb-2">
    Relevant Skills <span className="text-red-500">*</span>
  </label>

  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-3 rounded-lg">
    
    {[
      "Communication",
      "Leadership",
      "Teamwork",
      "Problem Solving",
      "Time Management",

      "HR Administration",
      "Recruitment & Interviewing",
      "Payroll Processing",
      "HRIS",
      "Employee Relations",

      "Microsoft Excel",
      "Microsoft Word",
      "PowerPoint",
      "Data Analysis",
      "General Administration",

      "Digital Marketing",
      "Social Media Management",
      "Content Creation",
      "Copywriting",
      "SEO / SEM",

      "Graphic Design",
      "Video Editing",
      "UI/UX Design",

      "Proposal Writing",
      "Report Writing",
      "Project Management",
      "Event Planning",
      "Research"
    ].map((skill) => (
      <label key={skill} className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          value={skill}
          checked={formData.skills.includes(skill)}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({
              ...prev,
              skills: prev.skills.includes(value)
                ? prev.skills.filter((s) => s !== value)
                : [...prev.skills, value],
            }));
          }}
        />
        <span>{skill}</span>
      </label>
    ))}
  </div>

  <p className="text-xs text-gray-500 mt-1">
    Select up to 5 skills that best represent your strengths.
  </p>
</div>


          {/* Residential Address */}

          <div>

            <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">

              Residential Address <span className="text-red-500">*</span>

            </label>

            <textarea

              id="address"

              name="address"

              value={formData.address}

              onChange={handleInputChange}

              required

              rows={3}

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"

              placeholder="123 Main Street, Apartment 4B"

            />

          </div>



          {/* Domicile */}

          <div>

            <label htmlFor="domicile" className="block text-sm font-medium text-gray-900 mb-2">

              Domicile <span className="text-red-500">*</span>

            </label>

            <select

              id="domicile"

              name="domicile"

              value={formData.domicile}

              onChange={handleInputChange}

              required

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"

            >

              <option value="">Select domicile</option>

              <option value="New York">New York</option>

              <option value="California">California</option>

              <option value="Texas">Texas</option>

              <option value="Florida">Florida</option>

              <option value="Illinois">Illinois</option>

              <option value="Indonesia">Indonesia</option>

              <option value="Other">Other</option>

            </select>

          </div>



          {/* Highest Level of Education */}

          <div>

            <label htmlFor="education" className="block text-sm font-medium text-gray-900 mb-2">

              Highest Level of Education <span className="text-red-500">*</span>

            </label>

            <select

              id="education"

              name="education"

              value={formData.education}

              onChange={handleInputChange}

              required

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"

            >

              <option value="">Select education level</option>

              <option value="High School">High School</option>

              <option value="Bachelor's Degree">Bachelor's Degree</option>

              <option value="Master's Degree">Master's Degree</option>

              <option value="Doctorate">Doctorate</option>

            </select>

          </div>



          {/* Availability to Start */}

          <div>

            <label htmlFor="availability" className="block text-sm font-medium text-gray-900 mb-2">

              Availability to Start <span className="text-red-500">*</span>

            </label>

            <input

              type="date"

              id="availability"

              name="availability"

              value={formData.availability}

              onChange={handleInputChange}

              required

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"

            />

          </div>



          {/* How did you hear about this opportunity */}

          <div>

            <label htmlFor="heardFrom" className="block text-sm font-medium text-gray-900 mb-2">

              How did you hear about this opportunity? <span className="text-red-500">*</span>

            </label>

            <select

              id="heardFrom"

              name="heardFrom"

              value={formData.heardFrom}

              onChange={handleInputChange}

              required

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"

            >

              <option value="">Select an option</option>

              <option value="LinkedIn">LinkedIn</option>

              <option value="JobStreet">JobStreet</option>

              <option value="SEEK">SEEK</option>

              <option value="Others">Others</option>

            </select>

          </div>



          {/* Upload CV */}

          <div>

            <label htmlFor="cv" className="block text-sm font-medium text-gray-900 mb-2">

              Upload CV <span className="text-red-500">*</span>

            </label>

            <input

              type="file"

              id="cv"

              name="cv"

              onChange={handleFileChange}

              required

              accept=".pdf,.doc,.docx"

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"

            />

            <p className="mt-1 text-sm text-gray-500">PDF or DOC format (max 10MB)</p>

          </div>



          {/* Upload Portfolio (Optional for Communication/Social Media) */}

          <div>

            <label htmlFor="portfolio" className="block text-sm font-medium text-gray-900 mb-2">

              Upload Portfolio (Optional)

            </label>

            <input

              type="file"

              id="portfolio"

              name="portfolio"

              onChange={handleFileChange}

              accept=".pdf,.doc,.docx,.zip,.rar"

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"

            />

            <p className="mt-1 text-sm text-gray-500">For Communication/Social Media positions: PDF, DOC, or ZIP format (max 20MB)</p>

          </div>



          {/* Submit Button */}

          <div className="pt-4">

            <button

              type="submit"

              disabled={isSubmitting}

              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:bg-gray-400 disabled:cursor-not-allowed"

            >

              {isSubmitting ? 'Submitting...' : 'Submit Application'}

            </button>

          </div>

        </form>



        {/* Footer */}

        <p className="text-center text-sm text-gray-500 mt-8">

          All fields marked with <span className="text-red-500">*</span> are required

        </p>

      </div>

    </div>

  );

}
