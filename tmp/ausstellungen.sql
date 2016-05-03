SELECT * FROM ivis_fs16.Ausstellung a
INNER JOIN ivis_fs16.Werkverknuepfung v ON a.hauptnr = v.a20_hauptnr
INNER JOIN ivis_fs16.Werk w ON w.hauptnr = v.O20_hauptnr
WHERE a.hauptnr = 12136096;