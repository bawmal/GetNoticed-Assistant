import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: '0.5in 0.75in',
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '2pt solid #1f2937',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  contactInfo: {
    fontSize: 9,
    color: '#4b5563',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: '1.5pt solid #d1d5db',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#374151',
  },
  experienceItem: {
    marginBottom: 6,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'semibold',
  },
  dateRange: {
    fontSize: 10,
    color: '#4b5563',
  },
  bulletList: {
    marginTop: 4,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#374151',
    marginBottom: 3,
    paddingLeft: 12,
  },
  educationItem: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  degree: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  institution: {
    fontSize: 10,
    color: '#374151',
  },
  skillsContainer: {
    marginBottom: 8,
  },
  skillCategory: {
    fontSize: 10,
    fontWeight: 'semibold',
    marginBottom: 4,
  },
  skillsList: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
})

// Traditional Template PDF Component
const TraditionalResumePDF = ({ content, jobTitle }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{content.personalDetails.name}</Text>
        <Text style={styles.title}>{content.personalDetails.title || jobTitle}</Text>
        <View style={styles.contactInfo}>
          <Text>{content.personalDetails.location}</Text>
          <Text>•</Text>
          <Text>{content.personalDetails.phone}</Text>
          <Text>•</Text>
          <Text>{content.personalDetails.email}</Text>
        </View>
        {(content.personalDetails.linkedin || content.personalDetails.portfolio || content.personalDetails.github) && (
          <View style={{ ...styles.contactInfo, marginTop: 4 }}>
            {content.personalDetails.linkedin && <Text>{content.personalDetails.linkedin}</Text>}
            {content.personalDetails.linkedin && (content.personalDetails.portfolio || content.personalDetails.github) && <Text>•</Text>}
            {(content.personalDetails.portfolio || content.personalDetails.github) && (
              <Text>{content.personalDetails.portfolio || content.personalDetails.github}</Text>
            )}
          </View>
        )}
      </View>

      {/* Professional Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summaryText}>{content.summary}</Text>
      </View>

      {/* Professional Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {(content.experience || []).map((exp, i) => (
          <View key={i} style={styles.experienceItem}>
            <View style={styles.experienceHeader}>
              <View>
                <Text style={styles.jobTitle}>{exp.title}</Text>
                <Text style={styles.company}>{exp.company} | {exp.location}</Text>
              </View>
              <Text style={styles.dateRange}>{exp.start_date} – {exp.end_date}</Text>
            </View>
            <View style={styles.bulletList}>
              {(exp.achievements || []).map((achievement, j) => (
                <Text key={j} style={styles.bullet}>• {achievement}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {(content.education || []).map((edu, i) => (
          <View key={i} style={styles.educationItem}>
            <View>
              <Text style={styles.degree}>{edu.degree} in {edu.field_of_study}</Text>
              <Text style={styles.institution}>{edu.institution}</Text>
            </View>
            {edu.graduation_year && <Text style={styles.dateRange}>{edu.graduation_year}</Text>}
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Competencies</Text>
        {content.skills.technical && content.skills.technical.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.skillCategory}>Technical Skills</Text>
            <Text style={styles.skillsList}>{content.skills.technical.join(' • ')}</Text>
          </View>
        )}
        {content.skills.soft && content.skills.soft.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.skillCategory}>Professional Skills</Text>
            <Text style={styles.skillsList}>{content.skills.soft.join(' • ')}</Text>
          </View>
        )}
        {content.skills.tools && content.skills.tools.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.skillCategory}>Tools & Technologies</Text>
            <Text style={styles.skillsList}>{content.skills.tools.join(' • ')}</Text>
          </View>
        )}
      </View>

      {/* Certifications */}
      {content.certifications && content.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {content.certifications.map((cert, i) => (
            <Text key={i} style={styles.bullet}>• {cert}</Text>
          ))}
        </View>
      )}
    </Page>
  </Document>
)

// Two-Column Template PDF Component
const TwoColumnResumePDF = ({ content, jobTitle }) => (
  <Document>
    <Page size="LETTER" style={{ padding: '0.5in', fontFamily: 'Helvetica', fontSize: 10 }}>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {/* Left Sidebar - 35% */}
        <View style={{ width: '35%', backgroundColor: '#f9fafb', padding: 16 }}>
          {/* Header */}
          <View style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1pt solid #d1d5db' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{content.personalDetails.name}</Text>
            <Text style={{ fontSize: 12, color: '#4b5563', marginBottom: 12 }}>{content.personalDetails.title || jobTitle}</Text>
            <View style={{ fontSize: 9, gap: 4 }}>
              <Text>{content.personalDetails.location}</Text>
              <Text>{content.personalDetails.phone}</Text>
              <Text style={{ color: '#2563eb' }}>{content.personalDetails.email}</Text>
              {content.personalDetails.linkedin && <Text style={{ color: '#2563eb', fontSize: 8 }}>{content.personalDetails.linkedin}</Text>}
              {(content.personalDetails.portfolio || content.personalDetails.github) && (
                <Text style={{ color: '#2563eb', fontSize: 8 }}>{content.personalDetails.portfolio || content.personalDetails.github}</Text>
              )}
            </View>
          </View>

          {/* Skills */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Skills</Text>
            {content.skills.technical && content.skills.technical.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 9, fontWeight: 'semibold', marginBottom: 4 }}>Technical</Text>
                {content.skills.technical.map((skill, i) => (
                  <Text key={i} style={{ fontSize: 9, marginBottom: 2 }}>• {skill}</Text>
                ))}
              </View>
            )}
            {content.skills.tools && content.skills.tools.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 9, fontWeight: 'semibold', marginBottom: 4 }}>Tools</Text>
                {content.skills.tools.map((skill, i) => (
                  <Text key={i} style={{ fontSize: 9, marginBottom: 2 }}>• {skill}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Education */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Education</Text>
            {(content.education || []).map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 9, fontWeight: 'semibold' }}>{edu.degree} in {edu.field_of_study}</Text>
                <Text style={{ fontSize: 9 }}>{edu.institution}</Text>
                {edu.graduation_year && <Text style={{ fontSize: 8, color: '#6b7280' }}>{edu.graduation_year}</Text>}
              </View>
            ))}
          </View>

          {/* Certifications */}
          {content.certifications && content.certifications.length > 0 && (
            <View>
              <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Certifications</Text>
              {content.certifications.map((cert, i) => (
                <Text key={i} style={{ fontSize: 9, marginBottom: 4 }}>• {cert}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Right Content - 65% */}
        <View style={{ width: '65%', paddingTop: 16 }}>
          {/* Summary */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Summary</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5, color: '#374151' }}>{content.summary}</Text>
          </View>

          <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1.5pt solid #d1d5db' }}>Experience</Text>
          
          {(content.experience || []).map((exp, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{exp.title}</Text>
                  <Text style={{ fontSize: 9, color: '#4b5563' }}>{exp.company} | {exp.location}</Text>
                </View>
                <Text style={{ fontSize: 9, color: '#6b7280' }}>{exp.start_date} – {exp.end_date}</Text>
              </View>
              <View style={{ marginTop: 4 }}>
                {(exp.achievements || []).map((achievement, j) => (
                  <Text key={j} style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 3 }}>• {achievement}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
)

// Executive Template PDF Component
const ExecutiveResumePDF = ({ content, jobTitle }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1pt solid #e5e7eb' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 4 }}>{content.personalDetails.name}</Text>
            <Text style={{ fontSize: 14, color: '#2563eb' }}>{content.personalDetails.title || jobTitle}</Text>
          </View>
          <View style={{ textAlign: 'right', fontSize: 10, color: '#4b5563' }}>
            <Text>{content.personalDetails.location}</Text>
            <Text>{content.personalDetails.phone}</Text>
            <Text style={{ color: '#2563eb' }}>{content.personalDetails.email}</Text>
            {content.personalDetails.linkedin && <Text style={{ color: '#2563eb', fontSize: 8 }}>{content.personalDetails.linkedin}</Text>}
            {(content.personalDetails.portfolio || content.personalDetails.github) && (
              <Text style={{ color: '#2563eb', fontSize: 8 }}>{content.personalDetails.portfolio || content.personalDetails.github}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Summary</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{content.summary}</Text>
      </View>

      {/* Two Column Layout */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {/* Main Content - 70% */}
        <View style={{ width: '70%' }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12 }}>Experience</Text>
          {(content.experience || []).map((exp, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{exp.title}</Text>
                  <Text style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', fontWeight: 'semibold' }}>{exp.company} | {exp.location}</Text>
                </View>
                <Text style={{ fontSize: 10, color: '#6b7280' }}>{exp.start_date} – {exp.end_date}</Text>
              </View>
              <View style={{ marginTop: 4 }}>
                {(exp.achievements || []).map((achievement, j) => (
                  <Text key={j} style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 3 }}>• {achievement}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Sidebar - 30% */}
        <View style={{ width: '30%' }}>
          {/* Core Competencies */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Core Competencies</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {[...(content.skills.technical || []), ...(content.skills.soft || [])].slice(0, 12).map((skill, i) => (
                <Text key={i} style={{ fontSize: 8, backgroundColor: '#dbeafe', color: '#1e40af', padding: '4 8', borderRadius: 4 }}>{skill}</Text>
              ))}
            </View>
          </View>

          {/* Education */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Education</Text>
            {(content.education || []).map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 9, fontWeight: 'semibold', textTransform: 'uppercase' }}>{edu.institution}</Text>
                <Text style={{ fontSize: 9 }}>{edu.degree} in {edu.field_of_study}</Text>
                {edu.graduation_year && <Text style={{ fontSize: 8, color: '#6b7280' }}>{edu.graduation_year}</Text>}
              </View>
            ))}
          </View>

          {/* Certifications */}
          {content.certifications && content.certifications.length > 0 && (
            <View>
              <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Certifications</Text>
              {content.certifications.map((cert, i) => (
                <Text key={i} style={{ fontSize: 9, marginBottom: 4 }}>• {cert}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  </Document>
)

// Export functions to generate and download PDFs
export const generateTraditionalPDF = async (content, jobTitle, companyName = '') => {
  const blob = await pdf(<TraditionalResumePDF content={content} jobTitle={jobTitle} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const name = content.personalDetails.name.replace(/\s+/g, '_')
  const company = companyName.replace(/\s+/g, '_')
  const job = jobTitle.replace(/\s+/g, '_')
  link.download = company ? `${name}_Resume_${company}_${job}.pdf` : `${name}_Resume.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export const generateTwoColumnPDF = async (content, jobTitle, companyName = '') => {
  const blob = await pdf(<TwoColumnResumePDF content={content} jobTitle={jobTitle} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const name = content.personalDetails.name.replace(/\s+/g, '_')
  const company = companyName.replace(/\s+/g, '_')
  const job = jobTitle.replace(/\s+/g, '_')
  link.download = company ? `${name}_Resume_${company}_${job}.pdf` : `${name}_Resume.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export const generateExecutivePDF = async (content, jobTitle, companyName = '') => {
  const blob = await pdf(<ExecutiveResumePDF content={content} jobTitle={jobTitle} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const name = content.personalDetails.name.replace(/\s+/g, '_')
  const company = companyName.replace(/\s+/g, '_')
  const job = jobTitle.replace(/\s+/g, '_')
  link.download = company ? `${name}_Resume_${company}_${job}.pdf` : `${name}_Resume.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

// Creative Template PDF Component
const CreativeResumePDF = ({ content, jobTitle }) => (
  <Document>
    <Page size="LETTER" style={{ padding: '0.5in', fontFamily: 'Helvetica', fontSize: 10 }}>
      {/* Header with accent bar */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ backgroundColor: '#6366f1', height: 4, marginBottom: 12 }} />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>{content.personalDetails.name}</Text>
        <Text style={{ fontSize: 14, color: '#6366f1', fontWeight: 'semibold', marginBottom: 12 }}>{content.personalDetails.title || jobTitle}</Text>
        <View style={{ flexDirection: 'row', fontSize: 9, color: '#4b5563', gap: 12, flexWrap: 'wrap' }}>
          <Text>{content.personalDetails.location}</Text>
          <Text>•</Text>
          <Text>{content.personalDetails.phone}</Text>
          <Text>•</Text>
          <Text>{content.personalDetails.email}</Text>
          {content.personalDetails.linkedin && (
            <>
              <Text>•</Text>
              <Text style={{ fontSize: 8 }}>{content.personalDetails.linkedin}</Text>
            </>
          )}
          {(content.personalDetails.portfolio || content.personalDetails.github) && (
            <>
              <Text>•</Text>
              <Text style={{ fontSize: 8 }}>{content.personalDetails.portfolio || content.personalDetails.github}</Text>
            </>
          )}
        </View>
      </View>

      {/* Summary with accent */}
      <View style={{ marginBottom: 16, paddingLeft: 12, borderLeft: '3pt solid #6366f1' }}>
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#6366f1', marginBottom: 6 }}>PROFESSIONAL SUMMARY</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5, color: '#374151' }}>{content.summary}</Text>
      </View>

      {/* Experience */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#6366f1', marginBottom: 10, textTransform: 'uppercase' }}>Experience</Text>
        {(content.experience || []).map((exp, i) => (
          <View key={i} style={{ marginBottom: 12, paddingLeft: 8, borderLeft: '2pt solid #e5e7eb' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1f2937' }}>{exp.title}</Text>
                <Text style={{ fontSize: 9, color: '#6366f1', fontWeight: 'semibold' }}>{exp.company}</Text>
                <Text style={{ fontSize: 9, color: '#6b7280' }}>{exp.location}</Text>
              </View>
              <Text style={{ fontSize: 9, color: '#6b7280' }}>{exp.start_date} – {exp.end_date}</Text>
            </View>
            <View style={{ marginTop: 4 }}>
              {(exp.achievements || []).map((achievement, j) => (
                <Text key={j} style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 3, color: '#374151' }}>• {achievement}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Two Column Layout for Education and Skills */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {/* Education */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#6366f1', marginBottom: 8, textTransform: 'uppercase' }}>Education</Text>
          {(content.education || []).map((edu, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{edu.degree} in {edu.field_of_study}</Text>
              <Text style={{ fontSize: 9, color: '#6b7280' }}>{edu.institution}</Text>
              {edu.graduation_year && <Text style={{ fontSize: 9, color: '#6b7280' }}>{edu.graduation_year}</Text>}
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#6366f1', marginBottom: 8, textTransform: 'uppercase' }}>Skills</Text>
          {content.skills.technical && content.skills.technical.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: 'semibold', marginBottom: 3 }}>Technical</Text>
              <Text style={{ fontSize: 9, color: '#374151', lineHeight: 1.4 }}>{content.skills.technical.join(' • ')}</Text>
            </View>
          )}
          {content.skills.tools && content.skills.tools.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: 'semibold', marginBottom: 3 }}>Tools</Text>
              <Text style={{ fontSize: 9, color: '#374151', lineHeight: 1.4 }}>{content.skills.tools.join(' • ')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Certifications */}
      {content.certifications && content.certifications.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#6366f1', marginBottom: 8, textTransform: 'uppercase' }}>Certifications</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {content.certifications.map((cert, i) => (
              <Text key={i} style={{ fontSize: 9, backgroundColor: '#ede9fe', color: '#6366f1', padding: '4 8', borderRadius: 4 }}>{cert}</Text>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
)

// Minimalist Template PDF Component
const MinimalistResumePDF = ({ content, jobTitle }) => (
  <Document>
    <Page size="LETTER" style={{ padding: '0.75in', fontFamily: 'Helvetica', fontSize: 10 }}>
      {/* Header - Ultra Clean */}
      <View style={{ marginBottom: 24, textAlign: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8, letterSpacing: 1 }}>{content.personalDetails.name.toUpperCase()}</Text>
        <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 16, letterSpacing: 0.5 }}>{content.personalDetails.title || jobTitle}</Text>
        <View style={{ flexDirection: 'row', fontSize: 9, color: '#6b7280', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Text>{content.personalDetails.email}</Text>
          <Text>|</Text>
          <Text>{content.personalDetails.phone}</Text>
          <Text>|</Text>
          <Text>{content.personalDetails.location}</Text>
          {content.personalDetails.linkedin && (
            <>
              <Text>|</Text>
              <Text style={{ fontSize: 8 }}>{content.personalDetails.linkedin}</Text>
            </>
          )}
          {(content.personalDetails.portfolio || content.personalDetails.github) && (
            <>
              <Text>|</Text>
              <Text style={{ fontSize: 8 }}>{content.personalDetails.portfolio || content.personalDetails.github}</Text>
            </>
          )}
        </View>
      </View>

      {/* Summary */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 10, lineHeight: 1.6, color: '#374151', textAlign: 'justify' }}>{content.summary}</Text>
      </View>

      {/* Experience */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase', borderBottom: '1pt solid #000', paddingBottom: 4 }}>Experience</Text>
        {(content.experience || []).map((exp, i) => (
          <View key={i} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{exp.title}</Text>
              <Text style={{ fontSize: 9, color: '#6b7280' }}>{exp.start_date} – {exp.end_date}</Text>
            </View>
            <Text style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>{exp.company} • {exp.location}</Text>
            <View>
              {(exp.achievements || []).map((achievement, j) => (
                <Text key={j} style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 2, color: '#374151' }}>• {achievement}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Education */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase', borderBottom: '1pt solid #000', paddingBottom: 4 }}>Education</Text>
        {(content.education || []).map((edu, i) => (
          <View key={i} style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{edu.degree} in {edu.field_of_study}</Text>
              <Text style={{ fontSize: 9, color: '#6b7280' }}>{edu.institution}</Text>
            </View>
            {edu.graduation_year && <Text style={{ fontSize: 9, color: '#6b7280' }}>{edu.graduation_year}</Text>}
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase', borderBottom: '1pt solid #000', paddingBottom: 4 }}>Skills</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.6, color: '#374151' }}>
          {[...(content.skills.technical || []), ...(content.skills.tools || []), ...(content.skills.soft || [])].join(' • ')}
        </Text>
      </View>

      {/* Certifications */}
      {content.certifications && content.certifications.length > 0 && (
        <View>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase', borderBottom: '1pt solid #000', paddingBottom: 4 }}>Certifications</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.6, color: '#374151' }}>{content.certifications.join(' • ')}</Text>
        </View>
      )}
    </Page>
  </Document>
)

export const generateCreativePDF = async (content, jobTitle, companyName = '') => {
  const blob = await pdf(<CreativeResumePDF content={content} jobTitle={jobTitle} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const name = content.personalDetails.name.replace(/\s+/g, '_')
  const company = companyName.replace(/\s+/g, '_')
  const job = jobTitle.replace(/\s+/g, '_')
  link.download = company ? `${name}_Resume_${company}_${job}.pdf` : `${name}_Resume.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export const generateMinimalistPDF = async (content, jobTitle, companyName = '') => {
  const blob = await pdf(<MinimalistResumePDF content={content} jobTitle={jobTitle} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const name = content.personalDetails.name.replace(/\s+/g, '_')
  const company = companyName.replace(/\s+/g, '_')
  const job = jobTitle.replace(/\s+/g, '_')
  link.download = company ? `${name}_Resume_${company}_${job}.pdf` : `${name}_Resume.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

// Strategic Brief PDF Component
const StrategicBriefPDF = ({ brief, candidateName, companyName, jobTitle }) => (
  <Document>
    <Page size="LETTER" style={{ padding: '0.6in 0.75in', fontFamily: 'Helvetica', fontSize: 10 }}>
      {/* Header */}
      <View style={{ marginBottom: 16, paddingBottom: 10, borderBottom: '2pt solid #2563eb' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 3 }}>Strategic Brief</Text>
        <Text style={{ fontSize: 11, color: '#2563eb', marginBottom: 6 }}>{jobTitle} at {companyName}</Text>
        <Text style={{ fontSize: 9, color: '#6b7280' }}>Prepared by {candidateName}</Text>
      </View>

      {/* Case Study */}
      <View style={{ marginBottom: 16 }} wrap={false}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginBottom: 10 }}>1. Relevant Projects / Case Study</Text>
        <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 6, color: '#1f2937' }}>{brief.case_study.title}</Text>
          
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5 }}>{brief.case_study.opening_paragraph}</Text>
          </View>
          
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 9, fontWeight: 'semibold', color: '#374151', marginBottom: 4 }}>Vision & Value Proposition:</Text>
            <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5 }}>{brief.case_study.vision_and_value}</Text>
          </View>
          
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 9, fontWeight: 'semibold', color: '#374151', marginBottom: 4 }}>Anchored in Proven Results (from CV):</Text>
            <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5 }}>{brief.case_study.proven_results}</Text>
          </View>
          
          <View>
            <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5, fontWeight: 'semibold' }}>{brief.case_study.closing_statement}</Text>
          </View>
        </View>
      </View>

      {/* 90-Day Plan */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginBottom: 10 }}>2. 90-Day Plan</Text>
        <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 4 }}>
          {brief.ninety_day_plan.opening_statement && (
            <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5, marginBottom: 10, fontWeight: 'semibold' }}>
              {brief.ninety_day_plan.opening_statement}
            </Text>
          )}
          
          {brief.ninety_day_plan.phase_1 && (
            <View style={{ marginBottom: 10 }} wrap={false}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 }}>
                {brief.ninety_day_plan.phase_1.title}
              </Text>
              {brief.ninety_day_plan.phase_1.actions.map((action, i) => (
                <Text key={i} style={{ fontSize: 9, color: '#374151', marginBottom: 2, paddingLeft: 12 }}>• {action}</Text>
              ))}
            </View>
          )}
          
          {brief.ninety_day_plan.phase_2 && (
            <View style={{ marginBottom: 10 }} wrap={false}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 }}>
                {brief.ninety_day_plan.phase_2.title}
              </Text>
              {brief.ninety_day_plan.phase_2.actions.map((action, i) => (
                <Text key={i} style={{ fontSize: 9, color: '#374151', marginBottom: 2, paddingLeft: 12 }}>• {action}</Text>
              ))}
            </View>
          )}
          
          {brief.ninety_day_plan.phase_3 && (
            <View style={{ marginBottom: 10 }} wrap={false}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 }}>
                {brief.ninety_day_plan.phase_3.title}
              </Text>
              {brief.ninety_day_plan.phase_3.actions.map((action, i) => (
                <Text key={i} style={{ fontSize: 9, color: '#374151', marginBottom: 2, paddingLeft: 12 }}>• {action}</Text>
              ))}
            </View>
          )}
          
          {brief.ninety_day_plan.closing_statement && (
            <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5, fontWeight: 'semibold', fontStyle: 'italic' }}>
              {brief.ninety_day_plan.closing_statement}
            </Text>
          )}
        </View>
      </View>

      {/* KPIs */}
      <View>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginBottom: 10 }}>3. Key Performance Indicators (KPIs)</Text>
        <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 4 }}>
          {brief.kpis.opening_statement && (
            <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5, marginBottom: 10, fontWeight: 'semibold' }}>
              {brief.kpis.opening_statement}
            </Text>
          )}
          
          {brief.kpis.metrics && brief.kpis.metrics.map((metric, i) => (
            <View key={i} style={{ marginBottom: 8, paddingLeft: 8, borderLeft: '3pt solid #2563eb' }} wrap={false}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1f2937', marginBottom: 2 }}>{metric.name}</Text>
              <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5 }}>{metric.description}</Text>
            </View>
          ))}
          
          {brief.kpis.closing_statement && (
            <Text style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5, fontWeight: 'semibold', fontStyle: 'italic', marginTop: 6 }}>
              {brief.kpis.closing_statement}
            </Text>
          )}
        </View>
      </View>
    </Page>
  </Document>
)

export const generateStrategicBriefPDF = async (brief, candidateName, companyName, jobTitle) => {
  const blob = await pdf(<StrategicBriefPDF brief={brief} candidateName={candidateName} companyName={companyName} jobTitle={jobTitle} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const name = candidateName.replace(/\s+/g, '_')
  const company = companyName.replace(/\s+/g, '_')
  const job = jobTitle.replace(/\s+/g, '_')
  link.download = `${name}_Strategic_Brief_${company}_${job}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
