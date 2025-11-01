import { useState } from 'react'
import { Download, Edit2, Save } from 'lucide-react'
import html2pdf from 'html2pdf.js'

export default function EditableCoverLetter({ coverLetterText, candidateName, companyName, profileData, jobTitle }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(coverLetterText)
  
  // Extract personal info from the correct location
  // master_experience is stored as a JSON string in Supabase, need to parse it
  let personalInfo = null
  try {
    if (profileData?.master_experience) {
      const parsedExperience = typeof profileData.master_experience === 'string' 
        ? JSON.parse(profileData.master_experience)
        : profileData.master_experience
      personalInfo = parsedExperience?.personal_info
    } else if (profileData?.personal_info) {
      personalInfo = profileData.personal_info
    }
  } catch (error) {
    console.error('Error parsing master_experience:', error)
  }
  
  console.log('EditableCoverLetter - personalInfo:', personalInfo)
  
  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const handleExportPDF = () => {
    const element = document.getElementById('cover-letter-content')
    const opt = {
      margin: [0.5, 0.75, 0.5, 0.75],  // top, right, bottom, left
      filename: `CoverLetter_${candidateName.replace(/\s+/g, '_')}_${companyName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        windowWidth: 816,  // 8.5in * 96dpi = 816px
        width: 816
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(element).save()
  }

  const handleExportDOCX = async () => {
    const { docxGenerator } = await import('../lib/docxGenerator')
    // Pass profile data for complete header
    await docxGenerator.generateCoverLetter(
      content, 
      candidateName, 
      companyName,
      profileData,
      currentDate,
      jobTitle
    )
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary flex items-center gap-2"
        >
          {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
          {isEditing ? 'Save Changes' : 'Edit Cover Letter'}
        </button>
        <button
          onClick={handleExportPDF}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={18} />
          Export PDF
        </button>
      </div>

      {/* Cover Letter Content */}
      <div 
        id="cover-letter-content"
        className="bg-white shadow-lg"
        style={{ 
          width: '8.5in', 
          minHeight: 'auto',
          maxHeight: '11in',
          margin: '0 auto',
          padding: '0.5in 0.75in',
          fontFamily: "'Calibri', 'Arial', sans-serif"
        }}
      >
        {/* Title Header */}
        <div className="text-center mb-6 pb-3 border-b-2 border-gray-300">
          <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            Cover Letter for {jobTitle || 'Product Manager'} at {companyName}
          </h1>
        </div>

        {/* Header with Candidate Info */}
        <div className="mb-6">
          <div className="text-sm font-semibold">{personalInfo?.name || candidateName}</div>
          {/* Contact Info Line */}
          {(personalInfo?.location || personalInfo?.phone || personalInfo?.email) && (
            <div className="text-sm">
              {personalInfo?.location && <span>{personalInfo.location}</span>}
              {personalInfo?.phone && (
                <>
                  {personalInfo?.location && <span> | </span>}
                  <span>{personalInfo.phone}</span>
                </>
              )}
              {personalInfo?.email && (
                <>
                  {(personalInfo?.location || personalInfo?.phone) && <span> | </span>}
                  <span>{personalInfo.email}</span>
                </>
              )}
            </div>
          )}
          {/* LinkedIn */}
          {personalInfo?.linkedin && (
            <div className="text-sm">
              <a href={personalInfo.linkedin} className="text-blue-600 hover:underline">
                {personalInfo.linkedin}
              </a>
            </div>
          )}
          
          <div className="mt-4 text-sm">
            {currentDate}
          </div>
          
          <div className="mt-4 text-sm font-semibold">
            Dear Hiring Manager,
          </div>
        </div>

        {/* Cover Letter Body */}
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm p-4 border-2 border-blue-300 rounded"
            style={{ 
              lineHeight: '1.8',
              color: '#000',
              minHeight: '400px',
              fontFamily: "'Calibri', 'Arial', sans-serif"
            }}
          />
        ) : (
          <div 
            className="text-sm"
            style={{ 
              lineHeight: '1.8',
              color: '#000',
              textAlign: 'left'
            }}
            dangerouslySetInnerHTML={{ 
              __html: content
                // First, split consecutive bullets that are on the same line
                .replace(/(•[^•]+[.!?])\s+(•)/g, '$1\n\n$2')
                // Then, ensure line breaks after bullets before capital letters (closing paragraph)
                .replace(/(•[^•]+[.!?])\s+([A-Z][a-z])/g, '$1\n\n$2')
                .split(/\n+/) // Split on one or more newlines
                .map(line => {
                  const trimmed = line.trim()
                  if (!trimmed) return '' // Skip empty lines
                  
                  // Format bullet points with proper spacing
                  if (trimmed.startsWith('•')) {
                    return `<div style="display: flex; margin-bottom: 12px; line-height: 1.6;">
                      <span style="margin-right: 8px; flex-shrink: 0;">•</span>
                      <span style="flex: 1;">${trimmed.substring(1).trim()}</span>
                    </div>`
                  }
                  
                  // Regular paragraphs with spacing
                  return `<div style="margin-bottom: 16px; line-height: 1.8;">${trimmed}</div>`
                })
                .filter(line => line) // Remove empty strings
                .join('')
            }}
          />
        )}
        
        {/* Closing */}
        <div className="mt-8 text-sm">
          <div>Sincerely,</div>
          <div className="mt-8 font-semibold">{personalInfo?.name || candidateName}</div>
        </div>
      </div>
    </div>
  )
}
