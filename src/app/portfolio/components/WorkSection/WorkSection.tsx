'use client'

import { useState } from 'react'
import type { Project } from '@/types'
import { motion } from 'framer-motion'
import { PuzzleGrid } from './PuzzleGrid'
import { ProjectModal } from './ProjectModal'

const EASE_SMOOTH: [number, number, number, number] = [0.32, 0.72, 0, 1]

export function WorkSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null)

  function handleCardClick(project: Project, el: HTMLElement) {
    setSelectedProject(project)
    setTriggerEl(el)
    setModalOpen(true)
  }

  function handleClose() {
    setModalOpen(false)
  }

  return (
    <section
      id="sec-work"
      className="text-left"
      style={{ padding: '64px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        className="font-pixel text-[32px] font-normal tracking-[-0.02em] leading-[1.2] text-text-primary"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 8 }}
      >
        Design Work
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH, delay: 0.05 }}
        className="text-[15px] text-text-secondary leading-[1.5]"
        style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', marginBottom: 40 }}
      >
        Tap to explore case studies
      </motion.p>

      <PuzzleGrid onCardClick={handleCardClick} />

      <ProjectModal
        project={selectedProject}
        open={modalOpen}
        onClose={handleClose}
        triggerEl={triggerEl}
      />
    </section>
  )
}
