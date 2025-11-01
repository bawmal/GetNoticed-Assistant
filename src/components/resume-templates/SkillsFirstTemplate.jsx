import { useState } from 'react'
import { Download, Edit2, Save } from 'lucide-react'
import html2pdf from 'html2pdf.js'

export default function SkillsFirstTemplate({ resumeContent, jobTitle }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(resumeContent)

  const handleExportPDF = () => {
    const element = document.getElementById('resume-skills-first')
    const opt = {
      margin: 0.5,
      filename: `Resume_${content.personalDetails.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(element).save()
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
          {isEditing ? 'Save Changes' : 'Edit Resume'}
        </button>
        <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2">
          <Download size={18} />
          Export PDF
        </button>
      </div>

      {/* Resume Content - Skills-First Badge Style */}
      <div 
        id="resume-skills-first"
        className="bg-white shadow-lg"
        style={{ 
          width: '8.5in', 
          minHeight: '11in',
          margin: '0 auto',
          padding: '0.75in',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={`text-5xl font-black text-gray-900 mb-2 uppercase tracking-tight ${isEditing ? 'outline-dashed outline-2 outline-blue-300' : ''}`}
            onBlur={(e) => setContent({
              ...content,
              personalDetails: { ...content.personalDetails, name: e.target.textContent }
            })}
          >
            {content.personalDetails.name}
          </h1>
          <h2 
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={`text-xl font-medium ${isEditing ? 'outline-dashed outline-2 outline-blue-300' : ''}`}
            style={{ color: '#2563eb' }}
          >
            {content.personalDetails.title || jobTitle}
          </h2>
          <div className="flex gap-4 text-sm text-gray-600 mt-3">
            <span className="flex items-center gap-1">
              <span>📍</span> {content.personalDetails.location}
            </span>
            <span className="flex items-center gap-1">
              <span>✉️</span> {content.personalDetails.email}
            </span>
            <span className="flex items-center gap-1">
              <span>📞</span> {content.personalDetails.phone}
            </span>
            <span className="flex items-center gap-1">
              <span>🔗</span> 
              <a href={content.personalDetails.linkedin} className="text-blue-600">
                {content.personalDetails.linkedin.replace('https://', '').replace('http://', '')}
              </a>
            </span>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content - 60% */}
          <div className="w-[60%] space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Summary
              </h3>
              <p 
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`text-sm text-gray-700 leading-relaxed ${isEditing ? 'outline-dashed outline-2 outline-blue-300 p-2' : ''}`}
                onBlur={(e) => setContent({ ...content, summary: e.target.textContent })}
              >
                {content.summary}
              </p>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Experience
              </h3>
              
              {(content.experience || []).map((exp, i) => (
                <div key={i} className="mb-5 break-inside-avoid experience-item">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-4">
                      <h4 
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`font-bold text-gray-900 ${isEditing ? 'outline-dashed outline-1 outline-blue-300' : ''}`}
                      >
                        {exp.title}
                      </h4>
                      <div className="text-sm text-gray-600">
                        {exp.company} • {exp.location}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      {exp.start_date} - {exp.end_date}
                    </div>
                  </div>
                  
                  <ul className="list-none space-y-1 mt-2">
                    {(exp.achievements || []).map((achievement, j) => (
                      <li key={j} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <span 
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          className={`text-sm text-gray-700 ${isEditing ? 'outline-dashed outline-1 outline-blue-300' : ''}`}
                        >
                          {achievement}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {exp.impact_quote && (
                    <div className="mt-2 pl-3 border-l-2 border-blue-200">
                      <p className="text-xs italic text-gray-600">
                        "{exp.impact_quote}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - 40% */}
          <div className="w-[40%] space-y-6">
            {/* Skills - Badge Style */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(content.skills.technical || []).map((skill, i) => (
                  <span 
                    key={i}
                    className="text-xs font-medium text-white px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: '#2563eb' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Education
              </h3>
              {(content.education || []).map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {edu.degree}, {edu.field_of_study}
                  </div>
                  <div className="text-sm text-gray-700">{edu.institution}</div>
                  <div className="text-xs text-gray-600">{edu.graduation_date}</div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            {content.certifications && content.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                  Certifications
                </h3>
                <div className="space-y-1">
                  {content.certifications.map((cert, i) => (
                    <div key={i} className="text-xs text-gray-700">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
