import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Bookmark, Copy, CheckCircle, AlertCircle } from 'lucide-react';

function AutoFillBookmarklet() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await loadProfile(user.id);
    }
    setLoading(false);
  }

  async function loadProfile(userId) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();
    
    if (data) {
      setProfile(data);
    }
  }

  const generateBookmarkletCode = () => {
    if (!profile) return '';

    const profileData = {
      name: profile.master_experience?.personal_info?.name || '',
      email: profile.master_experience?.personal_info?.email || '',
      phone: profile.master_experience?.personal_info?.phone || '',
      location: profile.master_experience?.personal_info?.location || '',
      linkedin: profile.master_experience?.personal_info?.linkedin || '',
      summary: profile.master_experience?.professional_summary || '',
      experience: profile.master_experience?.experience || [],
      skills: profile.skills || []
    };

    const code = `
      (function(){
        const d=${JSON.stringify(profileData)};
        let msgEl=null;
        
        function showMsg(text,color,persist){
          if(msgEl)msgEl.remove();
          msgEl=document.createElement('div');
          msgEl.innerHTML='<div style="position:fixed;top:20px;right:20px;background:'+color+';color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:999999;font-family:sans-serif;font-size:14px;font-weight:500;">'+text+'</div>';
          document.body.appendChild(msgEl);
          if(!persist)setTimeout(()=>msgEl.remove(),4000);
        }
        
        function fillForm(doc){
          const inputs=doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]),textarea,select');
          let filled=0;
          
          inputs.forEach(i=>{
            try{
              const style=window.getComputedStyle(i);
              if(style.display==='none'||style.visibility==='hidden')return;
              
              const n=(i.name||'').toLowerCase();
              const id=(i.id||'').toLowerCase();
              const ph=(i.placeholder||'').toLowerCase();
              const ariaLabel=(i.getAttribute('aria-label')||'').toLowerCase();
              const dataQa=(i.getAttribute('data-qa')||'').toLowerCase();
              const className=(i.className||'').toLowerCase();
              let label='';
              if(i.labels&&i.labels[0])label=i.labels[0].textContent.toLowerCase();
              else{const l=doc.querySelector('label[for="'+i.id+'"]');if(l)label=l.textContent.toLowerCase();}
              const prevText=i.previousElementSibling?i.previousElementSibling.textContent.toLowerCase():'';
              
              const all=n+' '+id+' '+ph+' '+label+' '+ariaLabel+' '+dataQa+' '+className+' '+prevText;
              let val='';
              let fieldType = '';
              
              if(all.match(/first.*name|fname|given.*name/)&&!all.match(/last|sur/)){val=d.name.split(' ')[0];fieldType='first name';}
              else if(all.match(/last.*name|lname|sur.*name|family.*name/)){val=d.name.split(' ').slice(1).join(' ');fieldType='last name';}
              else if(all.match(/full.*name|your.*name|applicant.*name|name/)&&!all.match(/first|last|company|user/)){val=d.name;fieldType='full name';}
              else if(all.match(/email/)&&!all.match(/confirm/)){val=d.email;fieldType='email';}
              else if(all.match(/phone|mobile|tel/)&&!all.match(/type/)){val=d.phone;fieldType='phone';}
              else if(all.match(/address|street/)&&!all.match(/email/)){val=d.location;fieldType='address';}
              else if(all.match(/city|town/)&&!all.match(/country/)){const parts=d.location.split(',');val=parts[0]||d.location;fieldType='city';}
              else if(all.match(/state|province/)&&!all.match(/country/)){const parts=d.location.split(',');val=parts[1]?parts[1].trim():'';fieldType='state';}              else if(all.match(/country/)&&!all.match(/code/)){const parts=d.location.split(',');val=parts[parts.length-1]?parts[parts.length-1].trim():'';fieldType='country';}              else if(all.match(/zip|postal/)&&!all.match(/country/)){val='';fieldType='zip';}
              else if(all.match(/linkedin|profile.*url|linkedin.*url/)){val=d.linkedin;fieldType='linkedin';}
              else if(all.match(/github|git.*url/)){val='';fieldType='github';}
              else if(all.match(/resume|cv/)&&i.type!=='file'){val='';fieldType='resume url';}
              else if(i.tagName==='TEXTAREA'&&all.match(/cover.*letter|letter|why.*apply|motivation|why.*interest/)){val='Dear Hiring Manager,\\n\\nI am excited to apply for this position. '+d.summary;fieldType='cover letter';}
              else if(i.tagName==='TEXTAREA'&&all.match(/tell.*us|about.*you|yourself|experience|background|summary|impact|greatest.*impact/)){val=d.summary;fieldType='experience';}
              
              if(val&&val!==i.value){
                i.value=val;
                i.dispatchEvent(new Event('input',{bubbles:true}));
                i.dispatchEvent(new Event('change',{bubbles:true}));
                i.dispatchEvent(new Event('blur',{bubbles:true}));
                i.style.backgroundColor='#ecfdf5';
                i.style.borderColor='#10b981';
                filled++;
                setTimeout(()=>{i.style.backgroundColor='';i.style.borderColor='';},3000);
              }
            }catch(e){console.log('Field error:',e);}
          });
          return filled;
        }
        
        function tryFill(attempt){
          let totalFilled=fillForm(document);
          
          const iframes=document.querySelectorAll('iframe');
          iframes.forEach(iframe=>{
            try{
              const iframeDoc=iframe.contentDocument||iframe.contentWindow.document;
              if(iframeDoc)totalFilled+=fillForm(iframeDoc);
            }catch(e){console.log('Iframe blocked:',e);}
          });
          
          if(totalFilled>0){
            showMsg('✅ Filled '+totalFilled+' fields!','#10b981',false);
          }else if(attempt<3){
            showMsg('🔄 Waiting for form to load... ('+(attempt+1)+'/3)','#3b82f6',true);
            setTimeout(()=>tryFill(attempt+1),1500);
          }else{
            const applyBtn=document.querySelector('a[href*="apply"],button:not([type="submit"]):not([type="button"])');
            const btnText=applyBtn?'Click "'+applyBtn.textContent.trim()+'" first, then run again.':'Scroll down or click Apply button first.';
            showMsg('⚠️ No fields found. '+btnText,'#f59e0b',false);
          }
        }
        
        tryFill(0);
      })();
    `.replace(/\s+/g, ' ').trim();

    return `javascript:${encodeURIComponent(code)}`;
  };

  const bookmarkletHref = generateBookmarkletCode();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletHref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to use the auto-fill bookmarklet.</p>
          <a href="/login" className="btn-primary inline-block">Sign In</a>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-6">Please upload your CV first to use the auto-fill feature.</p>
          <a href="/profile-setup" className="btn-primary inline-block">Upload CV</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Bookmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Auto-Fill Bookmarklet</h1>
          <p className="text-xl text-gray-600">One-click form filling for job applications</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 How to Use</h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                <span><strong>Drag the button below</strong> to your bookmarks bar (show it with Cmd+Shift+B on Mac or Ctrl+Shift+B on Windows)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                <span><strong>Go to any job application page</strong> (LinkedIn, Indeed, Greenhouse, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                <span><strong>Click the bookmark</strong> and watch your info auto-fill!</span>
              </li>
            </ol>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center mb-8">
            <p className="text-gray-700 mb-4 font-medium">👇 Drag this button to your bookmarks bar:</p>
            <a
              href={bookmarkletHref}
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-move"
              onClick={(e) => e.preventDefault()}
            >
              🚀 GetNoticed Auto-Fill
            </a>
            <p className="text-sm text-gray-500 mt-4">Or copy the code below if drag-and-drop doesn't work</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Bookmarklet Code:</label>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {copied ? (
                  <><CheckCircle className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Code</>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={bookmarkletHref}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              What Gets Auto-Filled:
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-green-800">
              <li>✅ Full Name</li>
              <li>✅ Email Address</li>
              <li>✅ Phone Number</li>
              <li>✅ Location/Address</li>
              <li>✅ LinkedIn URL</li>
              <li>✅ Cover Letter Text</li>
              <li>✅ Experience Summary</li>
              <li>✅ Professional Background</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Important Limitations:
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>❌ <strong>Cannot upload files</strong> (CV/resume PDFs) - browser security prevents this</li>
              <li>⚠️ <strong>Manual file upload required</strong> - you'll need to attach your resume manually</li>
              <li>💡 <strong>Tip:</strong> Keep your resume PDF ready to upload after auto-filling text fields</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Your Profile Data
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <p className="font-medium text-gray-900">{profile.master_experience?.personal_info?.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-medium text-gray-900">{profile.master_experience?.personal_info?.email || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="font-medium text-gray-900">{profile.master_experience?.personal_info?.phone || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>
              <p className="font-medium text-gray-900">{profile.master_experience?.personal_info?.location || 'Not set'}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a href="/profile-setup" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Update Profile →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoFillBookmarklet;
