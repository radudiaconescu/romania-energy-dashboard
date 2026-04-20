import { describe, it, expect, vi } from 'vitest'
import { parseResponse } from './transelectrica'
import { ApiError } from './client'

// Fixture captured from Transelectrica /sen-filter on 2026-04-17
// Expected values: CONS=5084, PROD=5212, SOLD=-128, NUCL=1338, APE=1420, EOLIAN=83,
//                  FOTO=1306, GAZE=390, CARB=608, BMASA=54, ISPOZ=8
// Cross-border flows: BG=1614 (KOZL1+KOZL2+VARN+DOBR), HU=-156 (BEKE1+SAND),
//                    RS=-398 (DJER), UA=-312 (MUKA), MD=-876 (VULC)
// Sum invariant: 1614-156-398-312-876 = -128 = SOLD ✓
const FIXTURE =
  '[{"KOZL115":"514"},{"KUSJ":"0"},{"MUKA":"-312"},{"ISPOZ":"8"},{"CHEF":"1129"},{"KOZL2":"563"},{"CARB15":"609"},{"KOZL1":"561"},{"SOLD":"-128"},{"GOTE":"0"},{"CHEA":"291"},{"row1_HARTASEN_DATA":"26\\/4\\/17 17:03:37"},{"PARO":"74"},{"VULC":"-876"},{"NUCL15":"1338"},{"DJER15":"-449"},{"MUKA15":"-254"},{"CHEF15":"1021"},{"PROG":""},{"NUCL":"1338"},{"DOBR":"490"},{"IS":"8"},{"BEKE1":"-140"},{"PROD":"5212"},{"CARB":"608"},{"PANCEVO2115":"0"},{"SAND":"-16"},{"CHEA15":"249"},{"CONS15":"4923"},{"BMASA":"54"},{"EOLIAN":"83"},{"PARO15":"71"},{"IAS215":"0"},{"PANCEVO21":"0"},{"FOTO15":"1396"},{"BMASA15":"53"},{"VARN":"0"},{"Prot1TMS":""},{"PANCEVO22":"0"},{"PANCEVO2215":"0"},{"BEKE115":"-123"},{"UNGE":"0"},{"VARN15":"0"},{"APE":"1420"},{"IAS2":"0"},{"DJER":"-398"},{"SAND15":"-17"},{"GAZE":"390"},{"EOLIAN15":"68"},{"PLAN":"-196"},{"S110":"0"},{"GAZE15":"390"},{"FOTO":"1306"},{"CONS":"5084"},{"SIP_":"0"},{"COSE":"0"},{"DOBR15":"409"},{"CONS2":"4742"},{"KOZL215":"516"},{"CIOA":"0"},{"MINT15":"0"},{"KIKI":"0"},{"MINT":"0"}]'

describe('parseResponse', () => {
  it('parses real Transelectrica response correctly', () => {
    const snap = parseResponse(FIXTURE)

    expect(snap.consumption).toBe(5084)
    expect(snap.production).toBe(5212)
    expect(snap.balance).toBe(-128)
    expect(snap.nuclear).toBe(1338)
    expect(snap.hydro).toBe(1420)
    expect(snap.wind).toBe(83)
    expect(snap.solar).toBe(1306)
    expect(snap.gas).toBe(390)
    expect(snap.coal).toBe(608)
    expect(snap.biomass).toBe(54)
    expect(snap.pumpedStorage).toBe(8)
    expect(snap.timestamp).toBeGreaterThan(0)
  })

  it('parses cross-border flows correctly (DOBR included in Bulgaria)', () => {
    const snap = parseResponse(FIXTURE)

    // Bulgaria: KOZL1(561) + KOZL2(563) + VARN(0) + DOBR(490) = 1614
    expect(snap.flowBulgaria).toBe(1614)
    // Hungary: BEKE1(-140) + SAND(-16) = -156
    expect(snap.flowHungary).toBe(-156)
    // Serbia: PANCEVO21(0) + PANCEVO22(0) + DJER(-398) = -398
    expect(snap.flowSerbia).toBe(-398)
    // Ukraine: MUKA(-312)
    expect(snap.flowUkraine).toBe(-312)
    // Moldova: VULC(-876) + UNGE(0) + IAS2(0) = -876
    expect(snap.flowMoldova).toBe(-876)

    // Sum invariant: all cross-border flows must equal net balance (SOLD)
    const flowSum = snap.flowBulgaria + snap.flowHungary + snap.flowSerbia + snap.flowUkraine + snap.flowMoldova
    expect(flowSum).toBeCloseTo(snap.balance, 0)
  })

  it('handles negative ISPOZ (pumped storage consuming power)', () => {
    const modified = FIXTURE.replace('"ISPOZ":"8"', '"ISPOZ":"-456"')
    const snap = parseResponse(modified)
    // Must NOT be clamped to 0 — negative pumpedStorage is valid
    expect(snap.pumpedStorage).toBe(-456)
  })

  it('returns 0 and warns for non-numeric values (e.g. maintenance "N/A")', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const modified = FIXTURE.replace('"NUCL":"1338"', '"NUCL":"N/A"')

    const snap = parseResponse(modified)

    expect(snap.nuclear).toBe(0)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('NUCL'))
    warnSpy.mockRestore()
  })

  it('throws a non-retryable ApiError on invalid JSON', () => {
    let caught: unknown
    try {
      parseResponse('not json at all')
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(ApiError)
    expect((caught as ApiError).retryable).toBe(false)
  })

  it('throws a non-retryable ApiError when response shape is wrong (not an array)', () => {
    let caught: unknown
    try {
      parseResponse('{"CONS":"5000"}')
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(ApiError)
    expect((caught as ApiError).retryable).toBe(false)
  })

  it('handles missing fields gracefully (returns 0 with a warning)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // Minimal response with no CONS field
    const minimal = '[{"PROD":"1000"},{"SOLD":"50"}]'

    const snap = parseResponse(minimal)

    expect(snap.consumption).toBe(0)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('CONS'))
    warnSpy.mockRestore()
  })
})
