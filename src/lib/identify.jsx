import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

// Holds the state of one identification run across the /identify/* pages.
const Ctx = createContext(null)
export const useIdentify = () => useContext(Ctx)

const initial = { file: null, result: null, crop: '', feedbackDone: false }

export function IdentifyProvider({ children }) {
  const [state, setState] = useState(initial)
  const [previewUrl, setPreviewUrl] = useState(null)
  const urlRef = useRef(null)

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])

  const setFile = useCallback((file) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = file ? URL.createObjectURL(file) : null
    setPreviewUrl(urlRef.current)
    setState((s) => ({ ...initial, crop: s.crop, file }))
  }, [])

  const patch = useCallback((p) => setState((s) => ({ ...s, ...p })), [])
  const reset = useCallback(() => setFile(null), [setFile])

  const value = useMemo(() => ({ ...state, previewUrl, setFile, patch, reset }), [state, previewUrl, setFile, patch, reset])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
