import { describe, it, expect } from 'vitest'
import { parseMavenOutput } from '../parsers/mavenParser.ts'
import sampleError from '../../sample-error.txt?raw'

describe('mavenParser', () => {
  it('should parse sample-error.txt successfully', () => {
    const result = parseMavenOutput(sampleError)
    
    expect(result.type).toBe('success')
    if (result.type === 'error') return
    
    // Should find multiple conflicts
    expect(result.conflicts.length).toBeGreaterThan(0)
  })

  it('should find protobuf-java conflict with correct versions', () => {
    const result = parseMavenOutput(sampleError)
    
    expect(result.type).toBe('success')
    if (result.type === 'error') return
    
    const protobufConflict = result.conflicts.find(
      c => c.target.groupId === 'com.google.protobuf' && c.target.artifactId === 'protobuf-java'
    )
    
    expect(protobufConflict).toBeDefined()
    expect(protobufConflict!.versions).toContain('4.33.2')
    expect(protobufConflict!.versions).toContain('4.33.4')
    expect(protobufConflict!.highestVersion).toBe('4.33.4')
  })

  it('should find grpc-context conflict with correct versions', () => {
    const result = parseMavenOutput(sampleError)
    
    expect(result.type).toBe('success')
    if (result.type === 'error') return
    
    const grpcConflict = result.conflicts.find(
      c => c.target.groupId === 'io.grpc' && c.target.artifactId === 'grpc-context'
    )
    
    expect(grpcConflict).toBeDefined()
    expect(grpcConflict!.versions).toContain('1.27.2')
    expect(grpcConflict!.versions).toContain('1.70.0')
    expect(grpcConflict!.highestVersion).toBe('1.70.0')
  })

  it('should find guava conflict with multiple versions', () => {
    const result = parseMavenOutput(sampleError)
    
    expect(result.type).toBe('success')
    if (result.type === 'error') return
    
    const guavaConflict = result.conflicts.find(
      c => c.target.groupId === 'com.google.guava' && c.target.artifactId === 'guava'
    )
    
    expect(guavaConflict).toBeDefined()
    expect(guavaConflict!.versions.length).toBeGreaterThan(1)
    expect(guavaConflict!.highestVersion).toBeDefined()
  })

  it('should find slf4j-api conflict', () => {
    const result = parseMavenOutput(sampleError)
    
    expect(result.type).toBe('success')
    if (result.type === 'error') return
    
    const slf4jConflict = result.conflicts.find(
      c => c.target.groupId === 'org.slf4j' && c.target.artifactId === 'slf4j-api'
    )
    
    expect(slf4jConflict).toBeDefined()
    expect(slf4jConflict!.versions.length).toBeGreaterThan(1)
    expect(slf4jConflict!.highestVersion).toBeDefined()
  })

  it('should handle empty input', () => {
    const result = parseMavenOutput('')
    
    expect(result.type).toBe('error')
    if (result.type === 'success') return
    
    expect(result.message).toBe('Empty input')
  })

  it('should handle input without ERROR lines', () => {
    const result = parseMavenOutput('some random text without error markers')
    
    expect(result.type).toBe('error')
    if (result.type === 'success') return
    
    expect(result.message).toContain('No [ERROR] lines found')
  })
})
