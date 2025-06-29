import { ImageResponse } from 'next/og'
import { ShieldAlert } from 'lucide-react'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        <ShieldAlert 
          style={{
            color: 'white',
            width: 20,
            height: 20,
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
