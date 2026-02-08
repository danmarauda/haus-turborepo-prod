/**
 * Vault Components
 * 
 * Document vault UI components for secure document storage
 * and AI-powered property image analysis
 */

// Document display
export { DocumentCard } from './DocumentCard';
export type { 
  DocumentCardProps, 
  VaultDocument, 
  DocumentCategory, 
  DocumentAnalysis,
  AnalysisStatus 
} from './DocumentCard';

// Upload
export { UploadButton } from './UploadButton';
export type { UploadButtonProps } from './UploadButton';

// Analysis results
export { AnalysisResults, AnalysisBadge } from './AnalysisResults';
export type { AnalysisResultsProps } from './AnalysisResults';
