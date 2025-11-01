import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx'
import { saveAs } from 'file-saver'

export const docxGenerator = {
  // Generate resume DOCX from JSON content
  async generateResume(resumeContent, jobTitle) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header - Name
          new Paragraph({
            text: resumeContent.personalDetails.name,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),

          // Job Title
          new Paragraph({
            text: resumeContent.personalDetails.title || jobTitle,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),

          // Contact Info
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `${resumeContent.personalDetails.location} | `,
                size: 20
              }),
              new TextRun({
                text: resumeContent.personalDetails.email,
                size: 20
              }),
              new TextRun({
                text: ` | ${resumeContent.personalDetails.phone}`,
                size: 20
              }),
              new TextRun({
                text: ` | ${resumeContent.personalDetails.linkedin}`,
                size: 20
              })
            ]
          }),

          // Summary Section
          new Paragraph({
            text: 'PROFESSIONAL SUMMARY',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: resumeContent.summary,
            spacing: { after: 300 }
          }),

          // Skills Section
          new Paragraph({
            text: 'SKILLS',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...(resumeContent.skills.technical || []).map(skill => 
            new Paragraph({
              text: `• ${skill}`,
              spacing: { after: 50 }
            })
          ),

          // Experience Section
          new Paragraph({
            text: 'PROFESSIONAL EXPERIENCE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 }
          }),
          ...(resumeContent.experience || []).flatMap(exp => [
            new Paragraph({
              spacing: { before: 200, after: 50 },
              children: [
                new TextRun({
                  text: exp.company,
                  bold: true,
                  size: 24
                }),
                new TextRun({
                  text: ` | ${exp.location}`,
                  size: 22
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: exp.title,
                  italics: true
                }),
                new TextRun({
                  text: ` | ${exp.start_date} - ${exp.end_date}`,
                  italics: true
                })
              ]
            }),
            ...(exp.achievements || []).map(achievement =>
              new Paragraph({
                text: `• ${achievement}`,
                spacing: { after: 50 }
              })
            )
          ]),

          // Education Section
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 }
          }),
          ...(resumeContent.education || []).map(edu =>
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: `${edu.degree} in ${edu.field_of_study}`,
                  bold: true
                }),
                new TextRun({
                  text: ` | ${edu.institution}`
                })
              ]
            })
          ),

          // Certifications Section
          ...(resumeContent.certifications && resumeContent.certifications.length > 0 ? [
            new Paragraph({
              text: 'CERTIFICATIONS',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 100 }
            }),
            ...(resumeContent.certifications || []).map(cert =>
              new Paragraph({
                text: `• ${cert}`,
                spacing: { after: 50 }
              })
            )
          ] : [])
        ]
      }]
    })

    const blob = await Packer.toBlob(doc)
    const fileName = `Resume_${resumeContent.personalDetails.name.replace(/\s+/g, '_')}.docx`
    saveAs(blob, fileName)
    
    return fileName
  },

  // Generate cover letter DOCX from markdown text
  async generateCoverLetter(coverLetterText, candidateName, companyName, profileData, currentDate, jobTitle) {
    const children = []
    
    // Add Title Header
    children.push(
      new Paragraph({
        text: `COVER LETTER FOR ${jobTitle?.toUpperCase() || 'PRODUCT MANAGER'} AT ${companyName.toUpperCase()}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        border: {
          bottom: {
            color: "CCCCCC",
            space: 1,
            style: "single",
            size: 6
          }
        }
      })
    )
    
    // Add Candidate Info
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: profileData?.personal_info?.name || candidateName,
            bold: true
          })
        ],
        spacing: { after: 50, before: 200 }
      })
    )
    
    // Build contact info line (only include non-empty values)
    const contactParts = []
    if (profileData?.personal_info?.location) contactParts.push(profileData.personal_info.location)
    if (profileData?.personal_info?.phone) contactParts.push(profileData.personal_info.phone)
    if (profileData?.personal_info?.email) contactParts.push(profileData.personal_info.email)
    
    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          text: contactParts.join(' | '),
          spacing: { after: 50 }
        })
      )
    }
    
    if (profileData?.personal_info?.linkedin) {
      children.push(
        new Paragraph({
          text: profileData.personal_info.linkedin,
          spacing: { after: 100 }
        })
      )
    }
    
    // Add Date
    children.push(
      new Paragraph({
        text: currentDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        spacing: { after: 100, before: 100 }
      })
    )
    
    // Add Greeting
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Dear Hiring Manager,',
            bold: true
          })
        ],
        spacing: { after: 200, before: 100 }
      })
    )
    
    // Parse the cover letter body into paragraphs
    const lines = coverLetterText.split('\n').filter(line => line.trim())
    
    const bodyParagraphs = lines.map(line => {
      const trimmed = line.trim()
      
      // Check if it's a heading
      if (trimmed.startsWith('# ')) {
        return new Paragraph({
          text: trimmed.replace('# ', ''),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      } else if (trimmed.startsWith('## ')) {
        return new Paragraph({
          text: trimmed.replace('## ', ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      } else if (trimmed.startsWith('•')) {
        // Handle bullet points (our format uses •)
        // Remove the • since Word will add its own bullet
        return new Paragraph({
          text: trimmed.substring(1).trim(),
          spacing: { after: 100, left: 360 }, // Indent bullets
          bullet: {
            level: 0
          }
        })
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        // Handle markdown bullets
        return new Paragraph({
          text: trimmed.substring(2),
          spacing: { after: 100, left: 360 },
          bullet: {
            level: 0
          }
        })
      } else {
        return new Paragraph({
          text: trimmed,
          spacing: { after: 200 }
        })
      }
    })
    
    // Add body paragraphs to children
    children.push(...bodyParagraphs)
    
    // Add Closing
    children.push(
      new Paragraph({
        text: 'Sincerely,',
        spacing: { before: 300, after: 600 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: profileData?.personal_info?.name || candidateName,
            bold: true
          })
        ]
      })
    )

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    })

    const blob = await Packer.toBlob(doc)
    const fileName = `CoverLetter_${candidateName.replace(/\s+/g, '_')}_${companyName.replace(/\s+/g, '_')}.docx`
    saveAs(blob, fileName)
    
    return fileName
  }
}
