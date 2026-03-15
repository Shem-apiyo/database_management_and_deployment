const express = require('express');
const mysql   = require('mysql2');
const path    = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost', user: 'neema_admin',
    password: 'NeemaAdmin2026!', database: 'neema_db'
});

db.connect(err => {
    if (err) { console.error('DB connection failed:', err.message); return; }
    console.log('Connected to neema_db');
});

function q(sql, params, res) {
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

/* ── STATS ── */
app.get('/api/stats', (req, res) => {
    const keys = ['employees','projects','incidents','licenses','organizations','research','donors','audits'];
    const sqls = [
        'SELECT COUNT(*) n FROM Employees',
        'SELECT COUNT(*) n FROM Projects',
        'SELECT COUNT(*) n FROM Incidents WHERE ResolutionStatus IN ("Open","Investigating")',
        'SELECT COUNT(*) n FROM Licenses WHERE LicenseStatus="Pending Inspection"',
        'SELECT COUNT(*) n FROM Organizations',
        'SELECT COUNT(*) n FROM ResearchStudies',
        'SELECT COUNT(*) n FROM Donors',
        'SELECT COUNT(*) n FROM EnvironmentalAudits WHERE AuditStatus="Scheduled"'
    ];
    const stats = {};
    let done = 0;
    sqls.forEach((sql, i) => db.query(sql, (err, rows) => {
        stats[keys[i]] = err ? 0 : rows[0].n;
        if (++done === sqls.length) res.json(stats);
    }));
});

/* ── BRANCHES (lookup) ── */
app.get('/api/branches', (req, res) => q('SELECT * FROM Branches ORDER BY BranchID', [], res));

/* ── EMPLOYEES ── */
app.get('/api/employees', (req, res) => q(`
    SELECT e.EmployeeID,e.FirstName,e.LastName,e.DateOfBirth,e.IDNumber,e.Gender,
           e.BranchID,b.CountyName AS Branch,e.JobTitle,e.ManagerID,
           CONCAT(m.FirstName,' ',m.LastName) AS ManagerName
    FROM Employees e
    LEFT JOIN Branches b ON e.BranchID=b.BranchID
    LEFT JOIN Employees m ON e.ManagerID=m.EmployeeID
    ORDER BY e.EmployeeID`, [], res));

app.post('/api/employees', (req, res) => {
    const {EmployeeID,FirstName,LastName,DateOfBirth,IDNumber,Gender,BranchID,JobTitle,ManagerID} = req.body;
    q('INSERT INTO Employees (EmployeeID,FirstName,LastName,DateOfBirth,IDNumber,Gender,BranchID,JobTitle,ManagerID) VALUES (?,?,?,?,?,?,?,?,?)',
      [EmployeeID,FirstName,LastName,DateOfBirth,IDNumber,Gender,BranchID,JobTitle,ManagerID||null], res);
});

app.put('/api/employees/:id', (req, res) => {
    const {FirstName,LastName,DateOfBirth,IDNumber,Gender,BranchID,JobTitle,ManagerID} = req.body;
    q('UPDATE Employees SET FirstName=?,LastName=?,DateOfBirth=?,IDNumber=?,Gender=?,BranchID=?,JobTitle=?,ManagerID=? WHERE EmployeeID=?',
      [FirstName,LastName,DateOfBirth,IDNumber,Gender,BranchID,JobTitle,ManagerID||null,req.params.id], res);
});

app.delete('/api/employees/:id', (req, res) => q('DELETE FROM Employees WHERE EmployeeID=?', [req.params.id], res));

/* ── PROJECTS ── */
app.get('/api/projects', (req, res) => q(`
    SELECT p.*,b.CountyName AS Branch,
           CONCAT(e.FirstName,' ',e.LastName) AS ProjectLead
    FROM Projects p
    LEFT JOIN Branches b ON p.BranchID=b.BranchID
    LEFT JOIN Employees e ON p.ProjectLeadID=e.EmployeeID
    ORDER BY p.ProjectID`, [], res));

app.post('/api/projects', (req, res) => {
    const {ProjectID,ProjectName,ProjectType,Budget,StartDate,EndDate,BranchID,ProjectLeadID} = req.body;
    q('INSERT INTO Projects (ProjectID,ProjectName,ProjectType,Budget,StartDate,EndDate,BranchID,ProjectLeadID) VALUES (?,?,?,?,?,?,?,?)',
      [ProjectID,ProjectName,ProjectType,Budget,StartDate,EndDate,BranchID,ProjectLeadID], res);
});

app.put('/api/projects/:id', (req, res) => {
    const {ProjectName,ProjectType,Budget,StartDate,EndDate,BranchID,ProjectLeadID} = req.body;
    q('UPDATE Projects SET ProjectName=?,ProjectType=?,Budget=?,StartDate=?,EndDate=?,BranchID=?,ProjectLeadID=? WHERE ProjectID=?',
      [ProjectName,ProjectType,Budget,StartDate,EndDate,BranchID,ProjectLeadID,req.params.id], res);
});

app.delete('/api/projects/:id', (req, res) => q('DELETE FROM Projects WHERE ProjectID=?', [req.params.id], res));

/* ── ORGANIZATIONS ── */
app.get('/api/organizations', (req, res) => q(`
    SELECT o.*,b.CountyName AS Branch
    FROM Organizations o
    LEFT JOIN Branches b ON o.BranchID=b.BranchID
    ORDER BY o.OrganizationID`, [], res));

app.post('/api/organizations', (req, res) => {
    const {OrganizationID,OrganizationName,OrganizationFocus,BranchID,ContactEmail,ContactPhone} = req.body;
    q('INSERT INTO Organizations (OrganizationID,OrganizationName,OrganizationFocus,BranchID,ContactEmail,ContactPhone) VALUES (?,?,?,?,?,?)',
      [OrganizationID,OrganizationName,OrganizationFocus,BranchID,ContactEmail,ContactPhone], res);
});

app.put('/api/organizations/:id', (req, res) => {
    const {OrganizationName,OrganizationFocus,BranchID,ContactEmail,ContactPhone} = req.body;
    q('UPDATE Organizations SET OrganizationName=?,OrganizationFocus=?,BranchID=?,ContactEmail=?,ContactPhone=? WHERE OrganizationID=?',
      [OrganizationName,OrganizationFocus,BranchID,ContactEmail,ContactPhone,req.params.id], res);
});

app.delete('/api/organizations/:id', (req, res) => q('DELETE FROM Organizations WHERE OrganizationID=?', [req.params.id], res));

/* ── LICENSES ── */
app.get('/api/licenses', (req, res) => q(`
    SELECT l.*,o.OrganizationName
    FROM Licenses l
    LEFT JOIN Organizations o ON l.OrganizationID=o.OrganizationID
    ORDER BY l.LicenseID`, [], res));

app.post('/api/licenses', (req, res) => {
    const {LicenseID,OrganizationID,LicenseType,ApplicationDate,LicenseStatus,IssueDate,ExpiryDate} = req.body;
    q('INSERT INTO Licenses (LicenseID,OrganizationID,LicenseType,ApplicationDate,LicenseStatus,IssueDate,ExpiryDate) VALUES (?,?,?,?,?,?,?)',
      [LicenseID,OrganizationID,LicenseType,ApplicationDate,LicenseStatus,IssueDate||null,ExpiryDate||null], res);
});

app.put('/api/licenses/:id', (req, res) => {
    const {OrganizationID,LicenseType,ApplicationDate,LicenseStatus,IssueDate,ExpiryDate} = req.body;
    q('UPDATE Licenses SET OrganizationID=?,LicenseType=?,ApplicationDate=?,LicenseStatus=?,IssueDate=?,ExpiryDate=? WHERE LicenseID=?',
      [OrganizationID,LicenseType,ApplicationDate,LicenseStatus,IssueDate||null,ExpiryDate||null,req.params.id], res);
});

app.delete('/api/licenses/:id', (req, res) => q('DELETE FROM Licenses WHERE LicenseID=?', [req.params.id], res));

/* ── INCIDENTS ── */
app.get('/api/incidents', (req, res) => q(`
    SELECT i.*,b.CountyName AS Branch,
           CONCAT(e.FirstName,' ',e.LastName) AS ReportedBy
    FROM Incidents i
    LEFT JOIN Branches b ON i.BranchID=b.BranchID
    LEFT JOIN Employees e ON i.ReportedByID=e.EmployeeID
    ORDER BY i.IncidentDate DESC`, [], res));

app.post('/api/incidents', (req, res) => {
    const {IncidentType,IncidentDate,Description,BranchID,ReportedByID,ResolutionStatus} = req.body;
    q('INSERT INTO Incidents (IncidentType,IncidentDate,Description,BranchID,ReportedByID,ResolutionStatus) VALUES (?,?,?,?,?,?)',
      [IncidentType,IncidentDate,Description,BranchID,ReportedByID,ResolutionStatus||'Open'], res);
});

app.put('/api/incidents/:id', (req, res) => {
    const {IncidentType,IncidentDate,Description,BranchID,ReportedByID,ResolutionStatus} = req.body;
    q('UPDATE Incidents SET IncidentType=?,IncidentDate=?,Description=?,BranchID=?,ReportedByID=?,ResolutionStatus=? WHERE IncidentID=?',
      [IncidentType,IncidentDate,Description,BranchID,ReportedByID,ResolutionStatus,req.params.id], res);
});

app.delete('/api/incidents/:id', (req, res) => q('DELETE FROM Incidents WHERE IncidentID=?', [req.params.id], res));

/* ── DONORS ── */
app.get('/api/donors', (req, res) => q('SELECT * FROM Donors ORDER BY DonorID', [], res));

app.post('/api/donors', (req, res) => {
    const {DonorName,DonorType,ContactPerson,ContactEmail,ContactPhone} = req.body;
    q('INSERT INTO Donors (DonorName,DonorType,ContactPerson,ContactEmail,ContactPhone) VALUES (?,?,?,?,?)',
      [DonorName,DonorType,ContactPerson,ContactEmail,ContactPhone], res);
});

app.put('/api/donors/:id', (req, res) => {
    const {DonorName,DonorType,ContactPerson,ContactEmail,ContactPhone} = req.body;
    q('UPDATE Donors SET DonorName=?,DonorType=?,ContactPerson=?,ContactEmail=?,ContactPhone=? WHERE DonorID=?',
      [DonorName,DonorType,ContactPerson,ContactEmail,ContactPhone,req.params.id], res);
});

app.delete('/api/donors/:id', (req, res) => q('DELETE FROM Donors WHERE DonorID=?', [req.params.id], res));

/* ── RESEARCH STUDIES ── */
app.get('/api/research', (req, res) => q(`
    SELECT rs.*,b.CountyName AS Branch,
           CONCAT(e.FirstName,' ',e.LastName) AS LeadResearcher
    FROM ResearchStudies rs
    LEFT JOIN Branches b ON rs.BranchID=b.BranchID
    LEFT JOIN Employees e ON rs.LeadResearcherID=e.EmployeeID
    ORDER BY rs.StudyID`, [], res));

app.post('/api/research', (req, res) => {
    const {StudyTitle,FocusArea,LeadResearcherID,BranchID,StartDate,EndDate,StudyStatus,Abstract} = req.body;
    q('INSERT INTO ResearchStudies (StudyTitle,FocusArea,LeadResearcherID,BranchID,StartDate,EndDate,StudyStatus,Abstract) VALUES (?,?,?,?,?,?,?,?)',
      [StudyTitle,FocusArea,LeadResearcherID,BranchID,StartDate,EndDate,StudyStatus,Abstract], res);
});

app.put('/api/research/:id', (req, res) => {
    const {StudyTitle,FocusArea,LeadResearcherID,BranchID,StartDate,EndDate,StudyStatus,Abstract} = req.body;
    q('UPDATE ResearchStudies SET StudyTitle=?,FocusArea=?,LeadResearcherID=?,BranchID=?,StartDate=?,EndDate=?,StudyStatus=?,Abstract=? WHERE StudyID=?',
      [StudyTitle,FocusArea,LeadResearcherID,BranchID,StartDate,EndDate,StudyStatus,Abstract,req.params.id], res);
});

app.delete('/api/research/:id', (req, res) => q('DELETE FROM ResearchStudies WHERE StudyID=?', [req.params.id], res));

/* ── AUDITS ── */
app.get('/api/audits', (req, res) => q(`
    SELECT ea.*,o.OrganizationName,
           CONCAT(e.FirstName,' ',e.LastName) AS LeadAuditor
    FROM EnvironmentalAudits ea
    LEFT JOIN Organizations o ON ea.OrganizationID=o.OrganizationID
    LEFT JOIN Employees e ON ea.LeadAuditorID=e.EmployeeID
    ORDER BY ea.AuditDate DESC`, [], res));

app.post('/api/audits', (req, res) => {
    const {OrganizationID,LeadAuditorID,AuditFocus,AuditDate,AuditStatus,ComplianceScore,NextAuditDate} = req.body;
    q('INSERT INTO EnvironmentalAudits (OrganizationID,LeadAuditorID,AuditFocus,AuditDate,AuditStatus,ComplianceScore,NextAuditDate) VALUES (?,?,?,?,?,?,?)',
      [OrganizationID,LeadAuditorID,AuditFocus,AuditDate,AuditStatus,ComplianceScore||null,NextAuditDate||null], res);
});

app.put('/api/audits/:id', (req, res) => {
    const {OrganizationID,LeadAuditorID,AuditFocus,AuditDate,AuditStatus,ComplianceScore,NextAuditDate} = req.body;
    q('UPDATE EnvironmentalAudits SET OrganizationID=?,LeadAuditorID=?,AuditFocus=?,AuditDate=?,AuditStatus=?,ComplianceScore=?,NextAuditDate=? WHERE AuditID=?',
      [OrganizationID,LeadAuditorID,AuditFocus,AuditDate,AuditStatus,ComplianceScore||null,NextAuditDate||null,req.params.id], res);
});

app.delete('/api/audits/:id', (req, res) => q('DELETE FROM EnvironmentalAudits WHERE AuditID=?', [req.params.id], res));

/* ── REPORTS (employee views) ── */
app.get('/api/reports/projects',    (req, res) => q('SELECT * FROM VW_Report_Projects_Overview',    [], res));
app.get('/api/reports/hr',          (req, res) => q('SELECT * FROM VW_Report_HR_Directory',         [], res));
app.get('/api/reports/incidents',   (req, res) => q('SELECT * FROM VW_Report_Incidents_Log',        [], res));
app.get('/api/reports/compliance',  (req, res) => q('SELECT * FROM VW_Report_Regulatory_Compliance',[], res));
app.get('/api/reports/finance',     (req, res) => q('SELECT * FROM VW_Report_Financial_Donations',  [], res));
app.get('/api/reports/research',    (req, res) => q('SELECT * FROM VW_Report_Research_Portfolio',   [], res));

app.listen(3000, () => console.log('Neema running at http://localhost:3000'));
