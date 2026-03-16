import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { colorSchemes, type IThumbnail, type ThumbnailStyle, type AspectRatio, AI_MODELS } from "../assets/assets"
import SoftBackdrop from '../components/SoftBackdrop'
import AspectRatioSelector from '../components/AspectRatioSelector'
import StyleSelector from '../components/StyleSelector'
import ColorSchemeSelector from '../components/ColorSchemeSelector'
import PreviewPanel from '../components/PreviewPanel'
import ImageUploader from '../components/ImageUploader'
import PrivacyWarningModal from '../components/PrivacyWarningModal'
import ModelSelector from '../components/ModelSelector'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../configs/api'
import useCredits from '../hooks/useCredits'
import { PLAN_BENEFITS, type Plan } from '../data/planBenefits'
import { useTranslation } from '../hooks/useTranslation'


function Generate() {

  const { id } = useParams()
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, fetchCredits } = useAuth();
  const { plan: currentPlan } = useCredits();
  const { t } = useTranslation();
  const planBenefits = PLAN_BENEFITS[(currentPlan as Plan) ?? 'free'];

  const [showUpgrade, setShowUpgrade] = useState(false);

  const [title, setTitle] = useState("")
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [referenceImage, setReferenceImage] = useState<File | null>(null)

  const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null)
  const [loading, setLoading] = useState(false)

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9")
  const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id)
  const [style, setStyle] = useState<ThumbnailStyle>("Bold & Graphic")
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id)

  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false)
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const handleGenerateClick = async () => {
    if (!isLoggedIn) {
      toast.error(t('generate.loginRequired'));
      return;
    }

    if (!title.trim()) {
      toast.error(t('generate.titleRequired'));
      return;
    }

    try {
      const { data } = await api.get('/api/billing/credits');
      const currentCredits: number = data.data.credits;

      if (currentCredits < 10) {
        toast.error(t('generate.insufficientCredits'));
        setShowUpgrade(true);
        return;
      }
    } catch {
      toast.error(t('generate.creditCheckFailed'));
      return;
    }

    setShowUpgrade(false);

    // If there's a reference image, show privacy warning first
    if (referenceImage) {
      setShowPrivacyModal(true);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    setShowPrivacyModal(false);
    setLoading (true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('prompt', additionalDetails);
      formData.append('style', style);
      formData.append('aspect_ratio', aspectRatio);
      formData.append('color_scheme', colorSchemeId);
      formData.append('text_overlay', 'true');
      formData.append('model', selectedModel);
      
      if (referenceImage) {
        formData.append('reference_image', referenceImage);
      }

      const {data} = await api.post('/api/thumbnail/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if(data.thumbnail){
        navigate(`/generate/${data.thumbnail._id}`);
        toast.success(data.message);
        await fetchCredits();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || t('generate.generationFailed'));
    } finally {
      setLoading(false);
    }
  }

  const fetchThumbnail = async () => {
    if(id) {
      try {
        const {data} = await api.get(`/api/user/thumbnail/${id}`);
        setThumbnail(data.thumbnail as IThumbnail);
        setLoading(!data?.thumbnail?.image_url);
        setAdditionalDetails(data?.thumbnail?.user_prompt);
        setTitle(data?.thumbnail?.title);
        setColorSchemeId(data?.thumbnail?.color_scheme);
        setAspectRatio(data?.thumbnail?.aspect_ratio);
        setStyle(data?.thumbnail?.style);
        if (data?.thumbnail?.model) setSelectedModel(data.thumbnail.model);
      } catch (error : any) {
        console.log(error);
        toast.error(error.response?.data?.message);
      } 
    }
  }

  useEffect(() => {
    if (isLoggedIn && id) {
      fetchThumbnail()
    }
    if (id && loading && isLoggedIn) {
      const interval = setInterval(() => {
        fetchThumbnail()
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [id, loading, isLoggedIn])

  useEffect(() => {
  if(!id && thumbnail){
    setThumbnail(null);
    setReferenceImage(null);
  }
  }, [pathname])

  return (
    <>
      <SoftBackdrop />
      <div className="pt-24 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">
            {/* Left panel*/}
            <div className={`space-y-6 ${id && 'pointer-events-none'}`}>
              <div className="p-6 rounded-2xl bg-white/8 border border-white/12 shadow-xl space-y-6">
                <div>
                  <h2 className='text-xl font-bold text-zinc-100 mb-1'>{t('generate.title')}</h2>
                  <p className='text-sm text-zinc-100'>{t('generate.subtitle')}</p>
                </div>

                <div className='space-y-5'>
                  {/* Title input*/}
                  <div>
                    <label htmlFor='title' className='block text-sm font-medium text-zinc-100 mb-2'>{t('generate.videoTitleLabel')}</label>
                    <input type='text' id='title' value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder={t('generate.videoTitlePlaceholder')} className='w-full px-4 py-3 rounded-lg border border-white/12 bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500' />
                    <div className='flex justify-end'>
                      <span className='text-xs text-zinc-400'>{title.length}/100</span>
                    </div>
                  </div>
                  {/* AspectRatioSelector*/}
                  <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                  {/* StyleSelector*/}
                  <StyleSelector value={style} onChange={setStyle} isOpen={styleDropdownOpen} setIsOpen={(open) => { setStyleDropdownOpen(open); if (open) setModelDropdownOpen(false); }} />
                  {/* ModelSelector*/}
                  <ModelSelector
                    value={selectedModel}
                    onChange={setSelectedModel}
                    currentPlan={currentPlan ?? 'free'}
                    isOpen={modelDropdownOpen}
                    setIsOpen={(open) => { setModelDropdownOpen(open); if (open) setStyleDropdownOpen(false); }}
                    currentStyle={style}
                  />
                  {/* ColorSchemeSelector*/}
                  <ColorSchemeSelector value={colorSchemeId} onChange={setColorSchemeId} />
                 
                  {/* Image uploader*/}
                  {planBenefits.referenceImageAllowed ? (
                    <ImageUploader onImageSelect={setReferenceImage} disabled={loading} />
                  ) : (
                    <div className="rounded-lg border border-dashed border-white/10 bg-white/4 p-4 text-center space-y-1">
                      <p className="text-sm text-zinc-400">{t('generate.referenceImageLocked')}</p>
                      <p className="text-xs text-zinc-500">{t('generate.referenceImageLockedDesc')}</p>
                      <button
                        type="button"
                        onClick={() => navigate('/pricing')}
                        className="text-xs text-red-400 hover:text-red-300 underline transition-colors"
                      >
                        {t('generate.upgradeToUnlock')}
                      </button>
                    </div>
                  )}

                  <div>
                    <label htmlFor='details' className='block text-sm font-medium'>{t('generate.additionalPromptsLabel')}<span className='text-zinc-400 text-xs'>{t('generate.detailsOptional')}</span></label>
                    <textarea value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} rows={3} placeholder={t('generate.detailsPlaceholder')} className='w-full px-4 py-3 rounded-lg border border-white/10 bg-white/6 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none' />
                  </div>
                </div>
                {/* Button*/}
                {!id && (
                  <div className='space-y-3'>
                    {!planBenefits.referenceImageAllowed && (
                      <p className='text-xs text-zinc-400 text-center'>{t('generate.freePlanNote')}</p>
                    )}
                    <button onClick={handleGenerateClick} disabled={loading} className='text-[15px] w-full py-3.5 rounded-xl font-medium bg-linear-to-b from-red-500 to-red-600 hover:from-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
                      {loading ? t('generate.generatingButton') : t('generate.generateButton')}
                    </button>
                    {showUpgrade && (
                      <button onClick={() => navigate('/pricing')} className='w-full py-2.5 rounded-xl text-sm font-medium border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors'>
                        {t('generate.upgradeButton')}
                      </button>
                    )}
                  </div>
                )}
              </div>


            </div>
            {/* Right panel*/}
            <div>
              <div className="p-6 rounded-2xl bg-white/8 border border-white/10 shadow-xl">
                <h2 className='text-lg font-semibold text-zinc-100 mb-4'>{t('generate.previewTitle')}</h2>
                <PreviewPanel thumbnail={thumbnail} isLoading={loading} aspectRatio={aspectRatio} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Privacy Warning Modal */}
      <PrivacyWarningModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onConfirm={handleGenerate}
      />
    </>
  )
}

export default Generate
