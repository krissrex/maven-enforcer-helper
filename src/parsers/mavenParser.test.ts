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

  it('should correctly parse dependencies with classifiers like linux-x86_64', () => {
    const input = `[ERROR] Rule 2: org.apache.maven.enforcer.rules.dependency.DependencyConvergence failed with message:[ERROR] Failed while enforcing releasability.
[ERROR]
[ERROR] Dependency convergence error for io.netty:netty-transport-native-epoll:jar:linux-x86_64:4.1.130.Final. Paths to dependency are:
[ERROR] +-no.coop.giftcard:coop-prepaid-ledger:jar:1.local-SNAPSHOT
[ERROR]   +-com.azure:azure-storage-blob:jar:12.33.1:compile
[ERROR]     +-com.azure:azure-core-http-netty:jar:1.16.3:compile
[ERROR]       +-io.netty:netty-transport-native-epoll:jar:linux-x86_64:4.1.130.Final:compile
[ERROR] and
[ERROR] +-no.coop.giftcard:coop-prepaid-ledger:jar:1.local-SNAPSHOT
[ERROR]   +-com.azure:azure-storage-blob:jar:12.33.1:compile
[ERROR]     +-com.azure:azure-core-http-netty:jar:1.16.3:compile
[ERROR]       +-io.projectreactor.netty:reactor-netty-http:jar:1.2.13:compile
[ERROR]         +-io.netty:netty-transport-native-epoll:jar:linux-x86_64:4.1.128.Final:compile
[ERROR] and
[ERROR] +-no.coop.giftcard:coop-prepaid-ledger:jar:1.local-SNAPSHOT
[ERROR]   +-com.azure:azure-storage-blob:jar:12.33.1:compile
[ERROR]     +-com.azure:azure-core-http-netty:jar:1.16.3:compile
[ERROR]       +-io.projectreactor.netty:reactor-netty-http:jar:1.2.13:compile
[ERROR]         +-io.projectreactor.netty:reactor-netty-core:jar:1.2.13:compile
[ERROR]           +-io.netty:netty-transport-native-epoll:jar:linux-x86_64:4.1.128.Final:compile`

    const result = parseMavenOutput(input)

    expect(result.type).toBe('success')
    if (result.type === 'error') return

    const nettyConflict = result.conflicts.find(
      c => c.target.groupId === 'io.netty' && c.target.artifactId === 'netty-transport-native-epoll'
    )

    expect(nettyConflict).toBeDefined()
    expect(nettyConflict!.versions).toContain('4.1.130.Final')
    expect(nettyConflict!.versions).toContain('4.1.128.Final')
    expect(nettyConflict!.highestVersion).toBe('4.1.130.Final')
    expect(nettyConflict!.target.version).toBe('4.1.130.Final')
  })

  it('should ignore "Failed to execute goal" lines and not parse them as dependencies', () => {
    const input = `[ERROR] Failed to execute goal org.apache.maven.plugins:maven-enforcer-plugin:3.6.2:enforce (enforce-maven) on project coop-prepaid-ledger:
[ERROR] Rule 2: org.apache.maven.enforcer.rules.dependency.DependencyConvergence failed with message:
[ERROR] Failed while enforcing releasability.
[ERROR]
[ERROR] Dependency convergence error for com.google.protobuf:protobuf-java:jar:4.33.2. Paths to dependency are:
[ERROR] +-no.coop.giftcard:coop-prepaid-ledger:jar:1.local-SNAPSHOT
[ERROR]   +-com.google.cloud:google-cloud-core:jar:2.64.1:compile
[ERROR]     +-com.google.protobuf:protobuf-java:jar:4.33.2:compile
[ERROR] and
[ERROR] +-no.coop.giftcard:coop-prepaid-ledger:jar:1.local-SNAPSHOT
[ERROR]   +-com.google.cloud:google-cloud-core:jar:2.64.1:compile
[ERROR]     +-com.google.api.grpc:proto-google-common-protos:jar:2.65.1:compile
[ERROR]       +-com.google.protobuf:protobuf-java:jar:4.33.4:compile`

    const result = parseMavenOutput(input)

    expect(result.type).toBe('success')
    if (result.type === 'error') return

    // Should NOT find maven-enforcer-plugin as a conflict
    const enforcerConflict = result.conflicts.find(
      c => c.target.groupId === 'org.apache.maven.plugins' && c.target.artifactId === 'maven-enforcer-plugin'
    )
    expect(enforcerConflict).toBeUndefined()

    // Should still find the actual conflict
    const protobufConflict = result.conflicts.find(
      c => c.target.groupId === 'com.google.protobuf' && c.target.artifactId === 'protobuf-java'
    )
    expect(protobufConflict).toBeDefined()
    expect(protobufConflict!.versions).toContain('4.33.2')
    expect(protobufConflict!.versions).toContain('4.33.4')
  })
})
