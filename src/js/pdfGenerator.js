import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getRiskLevel, formatMetarData, extractWeatherInfo } from './uiHelpers.js';

// Generate PDF report from weather data
export function generatePDF(weatherData, srcCity, destCity) {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(20);
    doc.text('Flight Weather Assessment Report', 105, 15, { align: 'center' });
    
    // Add route information
    doc.setFontSize(12);
    doc.text(`Route: ${srcCity} → ${destCity}`, 105, 25, { align: 'center' });
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
    
    // Add summary information
    doc.setFontSize(16);
    doc.text('Flight Summary', 14, 40);
    
    // Calculate overall risk level
    const riskScores = weatherData.map(item => item.weather.risk_score);
    const maxRiskScore = Math.max(...riskScores);
    
    let riskText, riskColor;
    if (maxRiskScore > 0) {
        riskText = 'High Risk - Not Recommended';
        riskColor = [231/255, 76/255, 60/255];
    } else if (maxRiskScore === 0) {
        riskText = 'Moderate Risk - Proceed with Caution';
        riskColor = [243/255, 156/255, 18/255];
    } else {
        riskText = 'Low Risk - Safe to Fly';
        riskColor = [46/255, 204/255, 113/255];
    }
    
    // Add summary data
    doc.setFontSize(12);
    doc.text(`Number of Cities En Route: ${weatherData.length}`, 14, 48);
    doc.text(`Weather Status: `, 14, 54);
    
    // Color the risk assessment
    const textWidth = doc.getTextWidth('Weather Status: ');
    doc.setTextColor(...riskColor);
    doc.text(riskText, 14 + textWidth, 54);
    doc.setTextColor(0, 0, 0); // Reset to black
    
    // Add route cities table
    doc.setFontSize(16);
    doc.text('Route Weather Conditions', 14, 65);
    
    const tableData = weatherData.map(location => {
        const { city, icao_code, weather } = location;
        const { risk_score, metar } = weather;
        const { riskText } = getRiskLevel(risk_score);
        const weatherDescription = extractWeatherInfo(metar);
        
        return [city, icao_code, weatherDescription, riskText];
    });
    
    doc.autoTable({
        startY: 70,
        head: [['City', 'ICAO Code', 'Weather Condition', 'Risk Level']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add detailed weather data
    const detailsY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.text('Detailed Weather Data', 14, detailsY);
    
    // Create detailed METAR and TAF section
    const detailedData = [];
    
    weatherData.forEach(location => {
        const { city, icao_code, weather } = location;
        const { metar, taf } = weather;
        
        detailedData.push([
            `${city} (${icao_code})`,
            formatMetarData(metar),
            taf || 'No TAF data available'
        ]);
    });
    
    doc.autoTable({
        startY: detailsY + 5,
        head: [['Location', 'METAR Data', 'TAF Data']],
        body: detailedData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 80 },
            2: { cellWidth: 80 }
        },
        styles: { overflow: 'linebreak' }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text('Flight Weather Assessment Tool © ' + new Date().getFullYear(), 105, 287, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 195, 287, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(`Flight_Weather_Report_${srcCity}_to_${destCity}.pdf`);
}