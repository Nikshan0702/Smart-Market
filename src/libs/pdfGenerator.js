// libs/pdfGenerator.js
const { jsPDF } = require('jspdf');

class ProofOfOrderGenerator {
  static generateProofOfOrder(tender, quote, company, dealer) {
    const doc = new jsPDF();
    
    // Set margins and initial position
    const margin = 20;
    let yPosition = margin;
    
    // Add company header
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147); // Dark blue
    doc.text(company.companyDetails?.name || company.firstName + ' ' + company.lastName, margin, yPosition);
    yPosition += 15;
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('PROOF OF ORDER / PURCHASE ORDER', margin, yPosition);
    yPosition += 20;
    
    // Order Details Section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('ORDER DETAILS', margin + 2, yPosition + 6);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.text(`Order Number: PO-${tender._id.toString().slice(-8).toUpperCase()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Order Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Quote Reference: Q-${quote._id.toString().slice(-8).toUpperCase()}`, margin, yPosition);
    yPosition += 15;
    
    // Two Column Layout for Company and Dealer Info
    const columnWidth = 80;
    
    // Company Information
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, columnWidth, 8, 'F');
    doc.setFontSize(12);
    doc.text('BUYER INFORMATION', margin + 2, yPosition + 6);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.text(`Company: ${company.companyDetails?.name || company.firstName + ' ' + company.lastName}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Email: ${company.email}`, margin, yPosition);
    yPosition += 6;
    if (company.companyDetails?.address) {
      const addressLines = doc.splitTextToSize(`Address: ${company.companyDetails.address}`, columnWidth - 5);
      doc.text(addressLines, margin, yPosition);
      yPosition += (addressLines.length * 5);
    }
    if (company.companyDetails?.phone) {
      doc.text(`Phone: ${company.companyDetails.phone}`, margin, yPosition);
      yPosition += 6;
    }
    
    yPosition += 10;
    
    // Dealer/Supplier Information
    const dealerYStart = yPosition - 40; // Adjust based on content height
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + columnWidth + 10, dealerYStart, columnWidth, 8, 'F');
    doc.setFontSize(12);
    doc.text('SUPPLIER INFORMATION', margin + columnWidth + 12, dealerYStart + 6);
    
    let dealerY = dealerYStart + 15;
    doc.setFontSize(10);
    doc.text(`Supplier: ${dealer.companyDetails?.name || dealer.firstName + ' ' + dealer.lastName}`, margin + columnWidth + 10, dealerY);
    dealerY += 6;
    doc.text(`Email: ${dealer.email}`, margin + columnWidth + 10, dealerY);
    dealerY += 6;
    if (dealer.companyDetails?.address) {
      const dealerAddressLines = doc.splitTextToSize(`Address: ${dealer.companyDetails.address}`, columnWidth - 5);
      doc.text(dealerAddressLines, margin + columnWidth + 10, dealerY);
      dealerY += (dealerAddressLines.length * 5);
    }
    if (dealer.companyDetails?.phone) {
      doc.text(`Phone: ${dealer.companyDetails.phone}`, margin + columnWidth + 10, dealerY);
      dealerY += 6;
    }
    
    // Update yPosition to continue from the lower of the two columns
    yPosition = Math.max(yPosition, dealerY) + 15;
    
    // Tender Details Section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, 'F');
    doc.setFontSize(12);
    doc.text('PROJECT DETAILS', margin + 2, yPosition + 6);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.text(`Tender Title: ${tender.title}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Category: ${tender.category.charAt(0).toUpperCase() + tender.category.slice(1)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Brand: ${tender.brandName || 'Not specified'}`, margin, yPosition);
    yPosition += 6;
    
    // Description with text wrapping
    doc.text('Description:', margin, yPosition);
    yPosition += 6;
    const descriptionLines = doc.splitTextToSize(tender.description, 170);
    doc.text(descriptionLines, margin, yPosition);
    yPosition += (descriptionLines.length * 5) + 6;
    
    if (tender.location) {
      doc.text(`Location: ${tender.location}`, margin, yPosition);
      yPosition += 6;
    }
    
    if (tender.requirements) {
      doc.text('Requirements:', margin, yPosition);
      yPosition += 6;
      const requirementLines = doc.splitTextToSize(tender.requirements, 170);
      doc.text(requirementLines, margin, yPosition);
      yPosition += (requirementLines.length * 5) + 6;
    }
    
    // Quote Details Section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, 'F');
    doc.setFontSize(12);
    doc.text('ORDER TERMS', margin + 2, yPosition + 6);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.text(`Approved Amount: $${quote.budget.toLocaleString()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Quote Submitted: ${new Date(quote.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Order Approved: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPosition);
    yPosition += 6;
    
    if (quote.notes) {
      doc.text('Supplier Notes:', margin, yPosition);
      yPosition += 6;
      const noteLines = doc.splitTextToSize(quote.notes, 170);
      doc.text(noteLines, margin, yPosition);
      yPosition += (noteLines.length * 5) + 6;
    }
    
    // Terms and Conditions
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, 'F');
    doc.setFontSize(12);
    doc.text('TERMS AND CONDITIONS', margin + 2, yPosition + 6);
    yPosition += 15;
    
    doc.setFontSize(8);
    const terms = [
      '1. This Proof of Order constitutes a formal purchase agreement between both parties.',
      '2. All work/services must be completed as per tender specifications and requirements.',
      '3. Payment will be processed upon successful completion and verification of work.',
      '4. Any modifications to this order must be approved in writing by both parties.',
      '5. This order is subject to the terms and conditions agreed upon in the partnership agreement.',
      '6. The supplier warrants that all work will be performed in a professional manner.',
      '7. Delivery/completion timeline should be mutually agreed upon by both parties.',
      '8. In case of disputes, both parties agree to resolve through mutual discussion primarily.'
    ];
    
    terms.forEach((term, index) => {
      const termLines = doc.splitTextToSize(term, 170);
      doc.text(termLines, margin, yPosition);
      yPosition += (termLines.length * 4) + 2;
    });
    
    // Signatures section (if there's space)
    if (yPosition < 250) {
      yPosition = 250;
      doc.setFontSize(10);
      doc.text('_________________________', 30, yPosition);
      doc.text('Authorized Company Representative', 25, yPosition + 10);
      
      doc.text('_________________________', 130, yPosition);
      doc.text('Authorized Supplier Representative', 120, yPosition + 10);
      
      yPosition += 25;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This document is computer generated and serves as official proof of order.', margin, yPosition);
    yPosition += 4;
    doc.text(`Document generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    
    return doc;
  }
  
  static generatePDFBlob(tender, quote, company, dealer) {
    const doc = this.generateProofOfOrder(tender, quote, company, dealer);
    return doc.output('blob');
  }
  
  static generateBase64PDF(tender, quote, company, dealer) {
    const doc = this.generateProofOfOrder(tender, quote, company, dealer);
    return doc.output('datauristring');
  }
}

module.exports = { ProofOfOrderGenerator };