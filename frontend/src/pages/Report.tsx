import {
  AlertCircle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ImagePlus,
  MapPin,
  Paperclip,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

type AnalysisResult = {
  category: string
  subcategory: string
  priority: string
  severity: string
  team: string
  confidence: number
  duplicate: boolean
  summary: string
}

export default function Report() {
  const navigate = useNavigate()

  const [room, setRoom] = useState('307')
  const [description, setDescription] = useState('')

  const [image, setImage] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState<string | null>(null)

  const [analyzing, setAnalyzing] =
    useState(false)

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null)

  const [submitted, setSubmitted] =
    useState(false)

  const [error, setError] =
    useState('')

  const handleImage = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    setImage(file)

    const reader = new FileReader()

    reader.onload = () => {
      setImagePreview(
        reader.result as string
      )
    }

    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const analyzeComplaint = () => {
    setError('')

    if (!room.trim()) {
      setError('Please enter your room number.')
      return
    }

    if (!description.trim()) {
      setError(
        'Please describe the problem before running AI analysis.'
      )
      return
    }

    setAnalyzing(true)

    /*
     * Demo AI analysis.
     *
     * Replace this section later with your backend
     * AI analysis API call.
     */

    setTimeout(() => {
      const text =
        description.toLowerCase()

      let category = 'Room Maintenance'
      let subcategory = 'General Maintenance'
      let team = 'General Maintenance Team'
      let priority = 'Medium'
      let severity = 'Medium'

      if (
        text.includes('water') ||
        text.includes('leak') ||
        text.includes('tap') ||
        text.includes('pipe')
      ) {
        category = 'Plumbing'
        subcategory = 'Water Leakage'
        team = 'Plumbing Maintenance'
      } else if (
        text.includes('fan') ||
        text.includes('light') ||
        text.includes('electric') ||
        text.includes('switch') ||
        text.includes('socket')
      ) {
        category = 'Electrical'
        subcategory = 'Electrical Equipment'
        team = 'Electrical Maintenance'
      } else if (
        text.includes('wifi') ||
        text.includes('internet') ||
        text.includes('network')
      ) {
        category = 'Internet'
        subcategory = 'Network Connectivity'
        team = 'IT / Network Support'
      } else if (
        text.includes('clean') ||
        text.includes('garbage') ||
        text.includes('dirty')
      ) {
        category = 'Sanitation'
        subcategory = 'Cleanliness'
        team = 'Housekeeping Team'
      }

      if (
        text.includes('danger') ||
        text.includes('spark') ||
        text.includes('smoke') ||
        text.includes('fire')
      ) {
        priority = 'Critical'
        severity = 'Critical'
      } else if (
        text.includes('urgent') ||
        text.includes('broken') ||
        text.includes('not working')
      ) {
        priority = 'High'
        severity = 'High'
      }

      setAnalysis({
        category,
        subcategory,
        priority,
        severity,
        team,
        confidence: 94,
        duplicate: false,
        summary: `The reported issue appears to be related to ${subcategory.toLowerCase()}. SmartHostel AI recommends routing this complaint to the ${team.toLowerCase()} for inspection and resolution.`,
      })

      setAnalyzing(false)
    }, 1600)
  }

  const submitComplaint = () => {
    setError('')

    if (!analysis) {
      setError(
        'Please analyze the complaint before submitting.'
      )
      return
    }

    /*
     * Connect this button to your existing complaint
     * creation API when your backend is ready.
     */

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={42} />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
            <Sparkles size={13} />
            AI processed successfully
          </div>

          <h1 className="mt-4 text-3xl font-black text-slate-950">
            Complaint Submitted
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your complaint has been recorded and routed
            to the appropriate maintenance team.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">

            <div className="flex items-center justify-between">

              <span className="text-xs font-bold text-slate-400">
                Complaint ID
              </span>

              <span className="text-lg font-black text-blue-700">
                #1022
              </span>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">

              <SummaryItem
                label="Category"
                value={analysis?.category || 'General'}
              />

              <SummaryItem
                label="Priority"
                value={analysis?.priority || 'Medium'}
              />

              <SummaryItem
                label="Room"
                value={room}
              />

              <SummaryItem
                label="Team"
                value={analysis?.team || 'Maintenance'}
              />

            </div>

          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() =>
                navigate('/student/complaints')
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
            >
              View My Complaints
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/student/dashboard')
              }
              className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </button>

          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-blue-950 to-teal-800 p-6 text-white shadow-xl sm:p-8">

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 backdrop-blur">
              <Sparkles size={27} />
            </div>

            <div>

              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Zap size={13} className="text-cyan-300" />
                AI-powered issue reporting
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Report a Complaint
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Tell us what's wrong. SmartHostel AI will
                analyze your issue, identify the category and
                priority, and help route it to the right team.
              </p>

            </div>

          </div>


          {/* Steps */}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">

            <Step
              number="01"
              title="Describe"
              text="Tell us what happened"
              active={!analysis}
            />

            <Step
              number="02"
              title="AI Analysis"
              text="Understand the issue"
              active={!!analysis}
            />

            <Step
              number="03"
              title="Submit"
              text="Send to maintenance"
              active={false}
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">

          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="font-semibold">
            {error}
          </p>

        </div>
      )}


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">

        {/* =================================================
            FORM
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

          <div className="mb-7 flex items-center justify-between">

            <div>

              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-600">
                Step 01
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Describe the problem
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Give us enough information for accurate AI analysis.
              </p>

            </div>

            <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 sm:flex">
              <ClipboardCheck size={20} />
            </div>

          </div>


          {/* ROOM */}

          <div>

            <label className="mb-2 block text-sm font-extrabold text-slate-800">
              Room number
            </label>

            <div className="relative">

              <MapPin
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={room}
                onChange={(e) =>
                  setRoom(e.target.value)
                }
                placeholder="Example: 307"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck size={13} />
              Your registered hostel block will be attached automatically.
            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between">

              <label className="block text-sm font-extrabold text-slate-800">
                What's the problem?
              </label>

              <span className="text-xs font-medium text-slate-400">
                {description.length}/500
              </span>

            </div>

            <textarea
              value={description}
              maxLength={500}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Example: There is continuous water leakage from the bathroom tap in Room 307..."
              className="min-h-[180px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
              <Sparkles
                size={13}
                className="mr-1 inline"
              />
              Tip: Mention what happened, where it happened,
              and whether the issue is urgent.
            </div>

          </div>


          {/* PHOTO UPLOAD */}

          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-extrabold text-slate-800">
                Add evidence
              </label>

              <span className="text-xs text-slate-400">
                Optional
              </span>

            </div>

            {!imagePreview ? (

              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 transition hover:border-blue-300 hover:bg-blue-50/40">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition group-hover:text-blue-600">
                  <ImagePlus size={23} />
                </div>

                <p className="mt-3 text-sm font-extrabold text-slate-700">
                  Upload a photo
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG or JPEG • Max 5 MB
                </p>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
                  <Upload size={14} />
                  Choose image
                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImage}
                  className="hidden"
                />

              </label>

            ) : (

              <div className="relative overflow-hidden rounded-2xl border border-slate-200">

                <img
                  src={imagePreview}
                  alt="Complaint evidence"
                  className="h-56 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-red-600"
                >
                  <X size={17} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">

                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check size={14} />
                    {image?.name || 'Image attached'}
                  </div>

                </div>

              </div>

            )}

          </div>


          {/* LOCATION */}

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                <MapPin size={18} />
              </div>

              <div className="flex-1">

                <p className="text-sm font-extrabold text-slate-800">
                  Complaint location
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {room
                    ? `Room ${room} • Hostel Block B`
                    : 'Enter your room number'}
                </p>

              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                Detected
              </span>

            </div>

          </div>


          {/* ANALYZE BUTTON */}

          <button
            type="button"
            onClick={analyzeComplaint}
            disabled={analyzing}
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-blue-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >

            {analyzing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                SmartHostel AI is analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze Complaint with AI
                <ArrowRight size={16} />
              </>
            )}

          </button>

        </section>


        {/* =================================================
            AI PANEL
        ================================================= */}

        <div className="space-y-6">

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 p-6 text-white shadow-xl">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <Sparkles size={23} />
                </div>

                <div>

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
                    AI Engine
                  </p>

                  <h2 className="text-lg font-black">
                    Smart Analysis
                  </h2>

                </div>

              </div>

              {!analysis ? (

                <div className="mt-7">

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Sparkles size={18} />
                      </div>

                      <div>

                        <p className="text-sm font-extrabold">
                          AI is ready
                        </p>

                        <p className="mt-0.5 text-xs text-blue-100">
                          Waiting for your complaint
                        </p>

                      </div>

                    </div>

                    <p className="mt-5 text-sm leading-6 text-blue-100">
                      After you describe the issue,
                      SmartHostel AI will analyze it and
                      identify the most relevant information.
                    </p>

                  </div>


                  <div className="mt-5 space-y-3">

                    <AIExpectation
                      icon={<ClipboardCheck size={16} />}
                      title="Category"
                      text="Identify the issue type"
                    />

                    <AIExpectation
                      icon={<AlertCircle size={16} />}
                      title="Severity & Priority"
                      text="Determine urgency"
                    />

                    <AIExpectation
                      icon={<RotateIcon />}
                      title="Duplicate Detection"
                      text="Check similar complaints"
                    />

                    <AIExpectation
                      icon={<Wrench size={16} />}
                      title="Smart Routing"
                      text="Suggest maintenance team"
                    />

                  </div>

                </div>

              ) : (

                <div className="mt-6 space-y-4">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold text-blue-100">
                      Analysis confidence
                    </span>

                    <span className="text-lg font-black text-cyan-200">
                      {analysis.confidence}%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                      style={{
                        width: `${analysis.confidence}%`,
                      }}
                    />

                  </div>


                  <AIResult
                    label="Category"
                    value={analysis.category}
                  />

                  <AIResult
                    label="Subcategory"
                    value={analysis.subcategory}
                  />

                  <AIResult
                    label="Priority"
                    value={analysis.priority}
                    warning={
                      analysis.priority === 'High' ||
                      analysis.priority === 'Critical'
                    }
                  />

                  <AIResult
                    label="Suggested Team"
                    value={analysis.team}
                  />

                </div>

              )}

            </div>

          </section>


          {/* DUPLICATE CHECK */}

          {analysis && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={19} />
                </div>

                <div>

                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    Duplicate Detection
                  </p>

                  <h3 className="mt-1 font-black text-slate-900">
                    No duplicate found
                  </h3>

                </div>

              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                SmartHostel AI checked existing complaints
                and did not identify a matching active issue.
              </p>

            </section>
          )}


          {/* HOW IT WORKS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">

              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Workflow
              </p>

              <h3 className="mt-1 text-lg font-black text-slate-950">
                What happens next?
              </h3>

            </div>

            <WorkflowStep
              number="01"
              title="AI analyzes"
              text="Complaint is classified"
              active={!!analysis}
            />

            <WorkflowStep
              number="02"
              title="Smart routing"
              text="Right team is identified"
              active={!!analysis}
            />

            <WorkflowStep
              number="03"
              title="Maintenance"
              text="Issue is assigned"
              active={false}
            />

            <WorkflowStep
              number="04"
              title="Resolution"
              text="You receive updates"
              active={false}
              last
            />

          </section>

        </div>

      </div>


      {/* =====================================================
          ANALYSIS RESULT
      ===================================================== */}

      {analysis && (
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">

          <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                  <Sparkles size={22} />
                </div>

                <div>

                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                    Step 02
                  </p>

                  <h2 className="text-xl font-black text-slate-950">
                    AI Analysis Complete
                  </h2>

                </div>

              </div>

              <span className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 sm:self-auto">
                <CheckCircle2 size={14} />
                {analysis.confidence}% confidence
              </span>

            </div>

          </div>


          <div className="p-6 sm:p-7">

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <AnalysisBox
                label="Category"
                value={analysis.category}
                icon={<ClipboardCheck size={18} />}
              />

              <AnalysisBox
                label="Severity"
                value={analysis.severity}
                icon={<AlertCircle size={18} />}
              />

              <AnalysisBox
                label="Priority"
                value={analysis.priority}
                icon={<Zap size={18} />}
              />

              <AnalysisBox
                label="Maintenance Team"
                value={analysis.team}
                icon={<Wrench size={18} />}
              />

            </div>


            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Sparkles size={17} />
                </div>

                <div>

                  <p className="text-xs font-black text-blue-800">
                    AI Summary
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {analysis.summary}
                  </p>

                </div>

              </div>

            </div>


            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setAnalysis(null)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
              >
                <X size={16} />
                Edit Complaint
              </button>

              <button
                type="button"
                onClick={submitComplaint}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-blue-700 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <CheckCircle2 size={17} />
                Submit Complaint
                <ArrowRight size={16} />
              </button>

            </div>

          </div>

        </section>
      )}

    </div>
  )
}


/* ============================================================
   STEP
============================================================ */

function Step({
  number,
  title,
  text,
  active,
}: {
  number: string
  title: string
  text: string
  active: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 ${
        active
          ? 'border-cyan-300/30 bg-white/15'
          : 'border-white/10 bg-white/5'
      }`}
    >

      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
          active
            ? 'bg-cyan-300 text-blue-950'
            : 'bg-white/10 text-blue-100'
        }`}
      >
        {number}
      </div>

      <div>

        <p className="text-sm font-extrabold">
          {title}
        </p>

        <p className="text-[11px] text-blue-100">
          {text}
        </p>

      </div>

    </div>
  )
}


/* ============================================================
   AI EXPECTATION
============================================================ */

function AIExpectation({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
        {icon}
      </div>

      <div>

        <p className="text-xs font-extrabold">
          {title}
        </p>

        <p className="text-[11px] text-blue-100">
          {text}
        </p>

      </div>

    </div>
  )
}


/* ============================================================
   AI RESULT
============================================================ */

function AIResult({
  label,
  value,
  warning = false,
}: {
  label: string
  value: string
  warning?: boolean
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">

      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black ${
          warning
            ? 'text-amber-200'
            : 'text-white'
        }`}
      >
        {value}
      </p>

    </div>
  )
}


/* ============================================================
   ANALYSIS BOX
============================================================ */

function AnalysisBox({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
        {icon}
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900">
        {value}
      </p>

    </div>
  )
}


/* ============================================================
   WORKFLOW STEP
============================================================ */

function WorkflowStep({
  number,
  title,
  text,
  active,
  last = false,
}: {
  number: string
  title: string
  text: string
  active: boolean
  last?: boolean
}) {
  return (
    <div className="flex gap-3">

      <div className="flex flex-col items-center">

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black ${
            active
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          {active ? (
            <Check size={14} />
          ) : (
            number
          )}
        </div>

        {!last && (
          <div className="h-7 w-px bg-slate-200" />
        )}

      </div>

      <div className="pb-3">

        <p className="text-xs font-black text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {text}
        </p>

      </div>

    </div>
  )
}


/* ============================================================
   SUMMARY ITEM
============================================================ */

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-black text-slate-800">
        {value}
      </p>

    </div>
  )
}


/* ============================================================
   ROTATE ICON
============================================================ */

function RotateIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}