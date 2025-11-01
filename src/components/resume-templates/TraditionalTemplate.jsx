import { useState } from 'react'
import { Download, Edit2, Save } from 'lucide-react'
import { generateTraditionalPDF } from '../../lib/pdfGenerator.jsx'

export default function TraditionalTemplate({ resumeContent, jobTitle, companyName = '' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(resumeContent)

  const handleExportPDF = async () => {
    await generateTraditionalPDF(content, jobTitle, companyName)
  }

  const handleExportDOCX = async () => {
    const { docxGenerator } = await import('../../lib/docxGenerator')
    await docxGenerator.generateResume(content, jobTitle)
  }

  return (
    <div className="space-y-4">
      {/* ATS Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>ATS Submission:</strong> Use DOCX format for ATS systems. PDF may not be readable by all ATS scanners.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mb-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary flex items-center gap-2"
        >
          {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
          {isEditing ? 'Save Changes' : 'Edit Resume'}
        </button>
        <button
          onClick={handleExportDOCX}
          className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Download size={18} />
          Export DOCX (ATS-Friendly)
        </button>
        <button
          onClick={handleExportPDF}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={18} />
          Export PDF (Visual)
        </button>
      </div>

      {/* Resume Content - Clean Professional Single Column */}
      <div 
        id="resume-traditional"
        className="bg-white shadow-lg"
        style={{ 
          width: '8.5in', 
          minHeight: '11in',
          margin: '0 auto',
          padding: '0.5in 0.75in',
          fontFamily: "'Calibri', 'Arial', sans-serif"
        }}
      >
        <style>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #resume-traditional {
              padding: 0.5in 0.75in !important;
              width: 8.5in !important;
              box-sizing: border-box !important;
            }
            @page {
              margin: 0.5in;
              size: letter;
            }
            .experience-item {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 0.75rem !important;
              padding-bottom: 0 !important;
            }
            .experience-item ul {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 0 !important;
            }
            .experience-item > div:last-child {
              margin-bottom: 0 !important;
            }
            h2 {
              page-break-after: avoid !important;
            }
            h3 {
              page-break-after: avoid !important;
            }
            .break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            /* Allow skills section to break if needed */
            .space-y-2 > div {
              page-break-inside: auto !important;
            }
            /* Prevent orphaned sections */
            div:last-child {
              page-break-after: avoid !important;
            }
            /* Prevent blank pages */
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Ensure dates don't wrap */
            .flex {
              display: flex !important;
            }
            .flex-shrink-0 {
              flex-shrink: 0 !important;
            }
            .whitespace-nowrap {
              white-space: nowrap !important;
            }
          }
          
          /* Screen display */
          @media screen {
            .experience-item {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}</style>

        {/* Header */}
        <div className="text-center mb-3 pb-2 border-b-2 border-gray-800">
          <h1 
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={`text-3xl font-bold text-gray-900 mb-1 tracking-tight ${isEditing ? 'outline-dashed outline-2 outline-blue-300' : ''}`}
            onBlur={(e) => setContent({
              ...content,
              personalDetails: { ...content.personalDetails, name: e.target.textContent }
            })}
          >
            {content.personalDetails.name}
          </h1>
          <h2 className="text-lg text-gray-700 font-medium mb-3">
            {content.personalDetails.title || jobTitle}
          </h2>
          <div className="text-sm text-gray-600 flex justify-center gap-3 flex-wrap">
            <span>{content.personalDetails.location}</span>
            <span>•</span>
            <span>{content.personalDetails.phone}</span>
            <span>•</span>
            <span>{content.personalDetails.email}</span>
            {content.personalDetails.linkedin && (
              <>
                <span>•</span>
                <a href={content.personalDetails.linkedin} className="text-blue-600 hover:underline text-xs">
                  {content.personalDetails.linkedin}
                </a>
              </>
            )}
            {(content.personalDetails.portfolio || content.personalDetails.github) && (
              <>
                <span>•</span>
                <a href={content.personalDetails.portfolio || content.personalDetails.github} className="text-blue-600 hover:underline text-xs">
                  {content.personalDetails.portfolio || content.personalDetails.github}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        <div className="mb-3">
          <h2 className="text-base font-bold text-gray-900 mb-2 pb-1 border-b-2 border-gray-300 uppercase tracking-wide">
            Professional Summary
          </h2>
          <p 
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={`text-sm text-gray-700 leading-normal ${isEditing ? 'outline-dashed outline-2 outline-blue-300 p-2' : ''}`}
            onBlur={(e) => setContent({ ...content, summary: e.target.textContent })}
          >
            {content.summary}
          </p>
        </div>

        {/* Professional Experience */}
        <div className="mb-3">
          <h2 className="text-base font-bold text-gray-900 mb-2 pb-1 border-b-2 border-gray-300 uppercase tracking-wide">
            Professional Experience
          </h2>
          
          {(content.experience || []).map((exp, i) => (
            <div key={i} className="mb-3 break-inside-avoid experience-item">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1 pr-4">
                  <h3 
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={`font-bold text-gray-900 text-base ${isEditing ? 'outline-dashed outline-1 outline-blue-300' : ''}`}
                  >
                    {exp.title}
                  </h3>
                  <div className="text-sm text-gray-700 font-semibold">
                    {exp.company} | {exp.location}
                  </div>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap flex-shrink-0">
                  {exp.start_date} – {exp.end_date}
                </span>
              </div>
              
              <ul className="space-y-1.5 mt-2">
                {(exp.achievements || []).map((achievement, j) => (
                  <li 
                    key={j}
                    className="flex items-start"
                  >
                    <span className="text-gray-600 mr-2 mt-0.5 flex-shrink-0">•</span>
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      className={`text-sm text-gray-700 leading-normal ${isEditing ? 'outline-dashed outline-1 outline-blue-300' : ''}`}
                    >
                      {achievement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="mb-3">
          <h2 className="text-base font-bold text-gray-900 mb-2 pb-1 border-b-2 border-gray-300 uppercase tracking-wide">
            Education
          </h2>
          {(content.education || []).map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="font-bold text-gray-900">
                    {edu.degree} in {edu.field_of_study}
                  </div>
                  <div className="text-sm text-gray-700">{edu.institution}</div>
                </div>
                {edu.graduation_year && (
                  <div className="text-sm text-gray-600 whitespace-nowrap flex-shrink-0">
                    {edu.graduation_year}
                  </div>
                )}
              </div>
              {edu.gpa && (
                <div className="text-sm text-gray-700 mt-1">GPA: {edu.gpa}</div>
              )}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-3">
          <h2 className="text-base font-bold text-gray-900 mb-2 pb-1 border-b-2 border-gray-300 uppercase tracking-wide">
            Core Competencies
          </h2>
          <div className="space-y-2">
            {content.skills.technical && content.skills.technical.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Technical Skills</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {content.skills.technical.join(' • ')}
                </p>
              </div>
            )}
            {content.skills.soft && content.skills.soft.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Professional Skills</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {content.skills.soft.join(' • ')}
                </p>
              </div>
            )}
            {content.skills.tools && content.skills.tools.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Tools & Technologies</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {content.skills.tools.join(' • ')}
                </p>
              </div>
            )}
            {content.skills.industry && content.skills.industry.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Industry Expertise</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {content.skills.industry.join(' • ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Certifications */}
        {content.certifications && content.certifications.length > 0 && (
          <div className="mb-3 break-inside-avoid">
            <h2 className="text-base font-bold text-gray-900 mb-2 pb-1 border-b-2 border-gray-300 uppercase tracking-wide">
              Certifications
            </h2>
            <ul className="list-disc list-inside space-y-1 ml-2 break-inside-avoid">
              {content.certifications.map((cert, i) => (
                <li key={i} className="text-sm text-gray-800">
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
