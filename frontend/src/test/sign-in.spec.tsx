import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock the SignIn component from Clerk
vi.mock('@clerk/clerk-react', () => {
    return {
        SignIn: ({ redirectUrl }: { redirectUrl?: string }) => (
            <div data-testid="mock-signin">{redirectUrl}</div>
        ),
    }
})

import { SignInPage } from '../routes/sign-in'

describe('SignInPage', () => {
    it('passes redirect param to Clerk SignIn', () => {
        // Simulate window.location.search
        const originalLocation = window.location
        // delete window.location to simulate assignment; tests run in jsdom
        // @ts-ignore - we intentionally replace window.location for the test
        delete (window as any).location
            // @ts-ignore
            ; (window as any).location = new URL('http://localhost/sign-in?redirect=/workspace/123')

        const { getByTestId } = render(<SignInPage />)
        const el = getByTestId('mock-signin')
        expect(el.textContent).toBe('/workspace/123')

        // Restore original location
        // @ts-ignore
        window.location = originalLocation as any
    })
})
