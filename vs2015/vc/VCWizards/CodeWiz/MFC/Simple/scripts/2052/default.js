// Copyright (c) Microsoft Corporation. All rights reserved.
// Script for MFC Add Simple Class

function OnPrep(selProj, selObj)
{
	var L_WizardDialogTitle_Text = "MFC ����";
	return PrepCodeWizard(selProj, L_WizardDialogTitle_Text);
}

function FindInitInstance()
{
    var oClasses = wizard.ProjectObject.CodeModel.GetClassesDerivedFrom("CWinApp");
    if (oClasses != null)
    {
        for (var nCntr = 1; nCntr <= oClasses.Count; nCntr++)
        {
            var oInitInstance = oClasses(nCntr).Functions.Find("InitInstance");
            if (oInitInstance)
                return oInitInstance;
        }
    }
    return false;
}

function OnFinish(selProj, selObj)
{
    var oCM;
    try
    {
        oCM = selProj.CodeModel;

        var strClassName = wizard.FindSymbol("CLASS_NAME");

        var L_TransactionName_Text = "��� MFC ���� ";
        oCM.StartTransaction(L_TransactionName_Text + strClassName);

        var strProjectPath = wizard.FindSymbol("PROJECT_PATH");
        var strTemplatePath = wizard.FindSymbol("TEMPLATES_PATH");
        var strIncludeHeader = wizard.FindSymbol("INCLUDE_HEADER");
        var strHeaderFile = wizard.FindSymbol("HEADER_FILE");
        var strImplFile = wizard.FindSymbol("IMPL_FILE");
        var strDialogID = wizard.FindSymbol("IDD_DIALOG");
        var strTemplateHeader = wizard.FindSymbol("TEMPLATE_HEADER");
        var strTemplateImpl = wizard.FindSymbol("TEMPLATE_IMPL");
        var strHTMLID = wizard.FindSymbol("HTML_ID");
        var strHTMLFile = wizard.FindSymbol("HTML_FILE");
        var strBaseClass = wizard.FindSymbol("BASE_CLASS");
        var bGenDocTemplate = wizard.FindSymbol("GEN_DOCTEMPLATE");
        var bMDI = wizard.FindSymbol("MDI_APP");
        var strDocumentClass = wizard.FindSymbol("DOCUMENT_CLASS");
        var strFrameClass = wizard.FindSymbol("FRAME_CLASS");
        var bAccessibility = wizard.FindSymbol("ACCESSIBILITY");
        var strProjectCPP = GetProjectFile(selProj, "CPP", false, true);

        var bDevice = IsDeviceProject(selProj);

        if (strIncludeHeader != "")
        {
            if (!DoesIncludeExist(selProj, strIncludeHeader, "stdafx.h"))
                oCM.AddInclude(strIncludeHeader, "stdafx.h", vsCMAddPositionEnd);
        }

        var strProjectRC = GetProjectFile(selProj, "RC", true);
        var oResHelper = wizard.ResourceHelper;

        if (wizard.FindSymbol("CREATE_DIALOG"))
        {
            SetResDlgFont();

            var strRCTemplFile = strTemplatePath;
            if (!bDevice)
            {
                if (strBaseClass == "CDHtmlDialog")
                    strRCTemplFile += "\\dhtmldlg.rc";
                else if (strBaseClass == "CFormView")
                    strRCTemplFile += "\\formview.rc";
                else
                    strRCTemplFile += "\\dialog.rc";

                oResHelper.OpenResourceFile(strProjectRC);
                var strTemporaryResourceFile = RenderToTemporaryResourceFile(strRCTemplFile);
                var strSymbolValue = oResHelper.AddResource(strDialogID, strTemporaryResourceFile, "DIALOG");
                if (strSymbolValue == null) return;
                oResHelper.CloseResourceFile();
            }
            else
            {
                var configs = selProj.Object.Configurations;
                var completedResourceFiles = new Array();

                var ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");

                for (var nCntr = 1; nCntr <= configs.Count; nCntr++)
                {
                    var config = configs.Item(nCntr);
                    var strCurrentResource = GetDeviceResourceFileForConfig(config);

                    if (completedResourceFiles.join(";").indexOf(strCurrentResource) == -1)
                    {
                        var platformName = config.Platform.Name;
                        var symbol = ProjWiz.GetBaseNativePlatformProperty(platformName, "UISymbol");
                        var strPlatformRCTemplFile = strRCTemplFile;

                        if (symbol == "POCKETPC2003_UI_MODEL")
                        {
                            if (strBaseClass == "CFormView")
                                strPlatformRCTemplFile += "\\formviewppc.rc";
                            else
                                strPlatformRCTemplFile += "\\dialogppc.rc";
                        }
                        else if (symbol == "SMARTPHONE2003_UI_MODEL")
                        {
                            if (strBaseClass == "CFormView")
                                strPlatformRCTemplFile += "\\formviewsp.rc";
                            else
                                strPlatformRCTemplFile += "\\dialogsp.rc";
                        }
                        else
                        {
                            if (strBaseClass == "CFormView")
                                strPlatformRCTemplFile += "\\formview.rc";
                            else
                                strPlatformRCTemplFile += "\\dialog.rc";
                        }

                        oResHelper.OpenResourceFile(strCurrentResource);
                        var strTemporaryResourceFile = RenderToTemporaryResourceFile(strPlatformRCTemplFile);
                        var strSymbolValue = oResHelper.AddResource(strDialogID, strTemporaryResourceFile, "DIALOG");
                        oResHelper.CloseResourceFile();
                        completedResourceFiles.push(strCurrentResource);
                    }
                }
            }

            wizard.AddSymbol("IDD_DIALOG", strSymbolValue.split("=").shift());
        }

        if (strBaseClass == "CDHtmlDialog")
        {
            RenderAddTemplate(wizard, "dhtmldlg.htm", strHTMLFile, selObj, false);
            oResHelper.OpenResourceFile(strProjectRC);
            var strSymbolValue = oResHelper.AddResource(strHTMLID, strProjectPath + strHTMLFile, "HTML");
            if (strSymbolValue == null) return;
            oResHelper.CloseResourceFile();
            wizard.AddSymbol("HTML_ID", strSymbolValue.split("=").shift());
        }

        RenderAddTemplate(wizard, strTemplateHeader, strHeaderFile, selObj, true);
        RenderAddTemplate(wizard, strTemplateImpl, strImplFile, selObj, false);

        // look for InitInstance
        var oInitInstance = false;
        if ((strBaseClass == "CFormView" && bGenDocTemplate) || bAccessibility)
            oInitInstance = FindInitInstance();

        // insert AfxOleInit()
        if (bAccessibility && oInitInstance)
        {
            var strBody = oInitInstance.BodyText;
            if (-1 == strBody.indexOf("AfxOleInit"))
            {
                oInitInstance.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert("\tAfxOleInit();\r\n");
                oCM.Synchronize();
            }
        }

        if (strBaseClass == "CFormView" && bGenDocTemplate)
        {
            var strMainFrameCaption = wizard.FindSymbol("DOCUMENT_MAIN_FRAME_CAPTION");
            var strFileNewNameShort = wizard.FindSymbol("DOCUMENT_FILE_NEW_NAME_SHORT");
            var strTypeName = wizard.FindSymbol("DOCUMENT_TYPE_NAME");
            var strFilterName = wizard.FindSymbol("DOCUMENT_FILTER_NAME");
            var strFileExt = wizard.FindSymbol("DOCUMENT_FILE_EXTENSION");
            var strFileTypeID = wizard.FindSymbol("DOCUMENT_FILE_TYPE_ID");
            var strFileNewNameLong = wizard.FindSymbol("DOCUMENT_FILE_NEW_NAME_LONG");
            var strTemp = strMainFrameCaption + "\\n" + strFileNewNameShort + "\\n" + strTypeName + "\\n" + strFilterName + "\\n." + strFileExt + "\\n" + strFileTypeID + "\\n" + strFileNewNameLong;

            var strID = CreateSafeName(strClassName).toUpperCase();
            if (strID.charAt(0) == "C")
                strID = strID.substr(1);
            strID = "IDR_" + strID + "_TMPL";

            if (!bDevice)
            {
                oResHelper.OpenResourceFile(strProjectRC);

                var strIconFile;
                if (strClassName.charAt(0) == "C" || strClassName.charAt(0) == "c")
                    strIconFile = strClassName.substr(1) + ".ico";
                else
                    strIconFile = strClassName + ".ico";
                strIconFile = GetUniqueFileName(strProjectPath, strIconFile);
                wizard.RenderTemplate(strTemplatePath + "\\formview.ico", strProjectPath + "res\\" + strIconFile, true); //don't process ico file
                var strSymbolValue = oResHelper.AddResource(strID, strProjectPath + "res\\" + strIconFile, "ICON", "", true);
                if (strSymbolValue == null) return;
                strID = strSymbolValue.split("=").shift();

                var strSymbolValue2 = oResHelper.AddResource(strID, strTemp, "STRING", "", true);
                if (strSymbolValue2 == null) return;

                if (bMDI)
                    strSymbolValue2 = oResHelper.AddResource(strID, strTemplatePath + "\\formviewmdi.rc", "MENU", "#include <afxres.h>", true);
                else
                    strSymbolValue2 = oResHelper.AddResource(strID, strTemplatePath + "\\formviewsdi.rc", "MENU", "#include <afxres.h>", true);
                if (strSymbolValue2 == null) return;

                oResHelper.CloseResourceFile();
            }
            else
            {
                var configs = selProj.Object.Configurations;
                var completedResourceFiles = new Array();

                var ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");

                for (var nCntr = 1; nCntr <= configs.Count; nCntr++)
                {
                    var config = configs.Item(nCntr);
                    var strCurrentResource = GetDeviceResourceFileForConfig(config);

                    if (completedResourceFiles.join(";").indexOf(strCurrentResource) == -1)
                    {
                        var platformName = config.Platform.Name;
                        var symbol = ProjWiz.GetBaseNativePlatformProperty(platformName, "UISymbol");

                        oResHelper.OpenResourceFile(strCurrentResource);

                        var strIconFile;
                        if (strClassName.charAt(0) == "C" || strClassName.charAt(0) == "c")
                            strIconFile = strClassName.substr(1) + ".ico";
                        else
                            strIconFile = strClassName + ".ico";
                        strIconFile = GetUniqueFileName(strProjectPath, strIconFile);
                        wizard.RenderTemplate(strTemplatePath + "\\formview.ico", strProjectPath + "res\\" + strIconFile, true); //don't process ico file
                        var strSymbolValue = oResHelper.AddResource(strID, strProjectPath + "res\\" + strIconFile, "ICON", "", true);
                        if (strSymbolValue == null) return;
                        strID = strSymbolValue.split("=").shift();

                        var strSymbolValue2 = oResHelper.AddResource(strID, strTemp, "STRING", "", true);
                        if (strSymbolValue == null) return;

                        // We won't add MENU resource for Pocket PC and Smartphone apps since they would also need the 
                        // corresponding RCDATA resource in order to work. RCDATA resource would be mangled by resource editor 
                        // into unreadable hexadecimal data if we put it into .rc file instead of .rc2 file. So we inclined NOT
                        // to add MENU resource unless it's Windows CE apps.
                        if (symbol == "STANDARDSHELL_UI_MODEL")
                        {
                            oResHelper.AddResource(strID, strTemplatePath + "\\formviewsdi.rc", "MENU", "#include <afxres.h>", true);
                        }
                        if (strSymbolValue2 == null) return;

                        oResHelper.CloseResourceFile();
                        completedResourceFiles.push(strCurrentResource);
                    }
                }
            }

            if (oInitInstance)
            {
                if (!DoesIncludeExist(selProj, strHeaderFile, strProjectCPP))
                    oCM.AddInclude('"' + strHeaderFile + '"', strProjectCPP, vsCMAddPositionEnd);

                var strInsert = "\t{\r\n";
                if (bMDI)
                    strInsert += "\t\tCMultiDocTemplate* pNewDocTemplate = new CMultiDocTemplate(\r\n";
                else
                    strInsert += "\t\tCSingleDocTemplate* pNewDocTemplate = new CSingleDocTemplate(\r\n";
                strInsert += "\t\t\t" + strID + ",\r\n";
                strInsert += "\t\t\tRUNTIME_CLASS(" + strDocumentClass + "),\r\n";
                strInsert += "\t\t\tRUNTIME_CLASS(" + strFrameClass + "),\r\n";
                strInsert += "\t\t\tRUNTIME_CLASS(" + strClassName + "));\r\n";
                strInsert += "\t\tAddDocTemplate(pNewDocTemplate);\r\n";
                strInsert += "\t}\r\n\r\n";
                oInitInstance.StartPointOf(vsCMPartBody, vsCMWhereDefinition).CreateEditPoint().Insert(strInsert);
                oCM.Synchronize();
            }
        }

        if (wizard.FindSymbol("AUTOMATION") || wizard.FindSymbol("CREATABLE"))
        {
            var strProjectIDL = GetProjectFile(selProj, "IDL");
            if (!strProjectIDL || strProjectIDL.length == 0)
                strProjectIDL = GetProjectFile(selProj, "ODL");
            if (strProjectIDL.length)
            {
                // Add #include "olectl.h" to strProject.idl
                if (!DoesIncludeExist(selProj, '"olectl.h"', strProjectIDL))
                    oCM.AddInclude('"olectl.h"', strProjectIDL, vsCMAddPositionEnd);

                // Render coclass.idl and insert into strProject.idl
                AddCoclassFromFile(oCM, "coclass.idl");
            }
        }


        oCM.CommitTransaction();

        var newClass = oCM.Classes.Find(strClassName);
        if(newClass)
            newClass.StartPoint.TryToShow(vsPaneShowTop);

    }
    catch (e)
    {
        if (oCM)
            oCM.AbortTransaction();

        if (e.description.length != 0)
            SetErrorInfo(e);
        return e.number
    }
}

// SIG // Begin signature block
// SIG // MIIa6AYJKoZIhvcNAQcCoIIa2TCCGtUCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFAAB5Z3U2TR0
// SIG // DIRKnIZXSwmWMWlioIIVgjCCBMMwggOroAMCAQICEzMA
// SIG // AACb4HQ3yz1NjS4AAAAAAJswDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE2MDMzMDE5
// SIG // MjEyOVoXDTE3MDYzMDE5MjEyOVowgbMxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjo3MjhELUM0NUYtRjlFQjEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAI2j4s+Bi9fLvwOiYPY7beLUGLA3BdWNNpwOc85N
// SIG // f6IQsnxDeywYV7ysp6aGfXmhtd4yZvmO/CDNq3N3z3ed
// SIG // b2Cca3jzxa2pvVtMK1WqUoBBQ0FmmaXwMGiGug8hch/D
// SIG // dT+SdsEA15ksqFk/wWKRbQn2ztMiui0An2bLU9HKVjpY
// SIG // TCGyhaOYZYzHiUpFWHurU0CfjGqyBcX+HuL/CqGootvL
// SIG // IY18lTDeMReKDelfzEJwyqQVFG6ED8LC/WwCTJOxTLbO
// SIG // tuzitc2aGhD1SOVXEHfqgd1fhEIycETJyryw+/dIOdhg
// SIG // dUmts79odC6UDhy+wXBydBAOzNtrUB8x6jT6bD0CAwEA
// SIG // AaOCAQkwggEFMB0GA1UdDgQWBBSWlbGeE1O6WCFGNOJ8
// SIG // xzlKbCDwdzAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA0GCSqGSIb3DQEBBQUAA4IBAQAhHbNT6TtG
// SIG // gaH6KhPjWiAkunalO7Z3yJFyBNbq/tKbIi+TCKKwbu8C
// SIG // pblWXv1l9o0Sfeon3j+guC4zMteWWj/DdDnJD6m2utr+
// SIG // EGjPiP2PIN6ysdZdKJMnt8IHpEclZbtS1XFNKWnoC1DH
// SIG // jJWWoF6sNzkC1V7zVCh5cdsXw0P8zWor+Q85QER8LGjI
// SIG // 0oHomSKrIFbm5O8khptmVk474u64ZPfln8p1Cu58lp9Z
// SIG // 4aygt9ZpvUIm0vWlh1IB7Cl++wW05tiXfBOAcTVfkybn
// SIG // 5F90lXF8A421H3X1orZhPe7EbIleZAR/KUts1EjqSkpM
// SIG // 54JutTq/VyYRyHiA1YDNDrtkMIIE7DCCA9SgAwIBAgIT
// SIG // MwAAAQosea7XeXumrAABAAABCjANBgkqhkiG9w0BAQUF
// SIG // ADB5MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSMwIQYDVQQDExpN
// SIG // aWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQTAeFw0xNTA2
// SIG // MDQxNzQyNDVaFw0xNjA5MDQxNzQyNDVaMIGDMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMQ0wCwYDVQQLEwRNT1BSMR4wHAYD
// SIG // VQQDExVNaWNyb3NvZnQgQ29ycG9yYXRpb24wggEiMA0G
// SIG // CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCS/G82u+ED
// SIG // uSjWRtGiYbqlRvtjFj4u+UfSx+ztx5mxJlF1vdrMDwYU
// SIG // EaRsGZ7AX01UieRNUNiNzaFhpXcTmhyn7Q1096dWeego
// SIG // 91PSsXpj4PWUl7fs2Uf4bD3zJYizvArFBKeOfIVIdhxh
// SIG // RqoZxHpii8HCNar7WG/FYwuTSTCBG3vff3xPtEdtX3gc
// SIG // r7b3lhNS77nRTTnlc95ITjwUqpcNOcyLUeFc0Tvwjmfq
// SIG // MGCpTVqdQ73bI7rAD9dLEJ2cTfBRooSq5JynPdaj7woY
// SIG // SKj6sU6lmA5Lv/AU8wDIsEjWW/4414kRLQW6QwJPIgCW
// SIG // Ja19NW6EaKsgGDgo/hyiELGlAgMBAAGjggFgMIIBXDAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUif4K
// SIG // MeomzeZtx5GRuZSMohhhNzQwUQYDVR0RBEowSKRGMEQx
// SIG // DTALBgNVBAsTBE1PUFIxMzAxBgNVBAUTKjMxNTk1KzA0
// SIG // MDc5MzUwLTE2ZmEtNGM2MC1iNmJmLTlkMmIxY2QwNTk4
// SIG // NDAfBgNVHSMEGDAWgBTLEejK0rQWWAHJNy4zFha5TJoK
// SIG // HzBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWND
// SIG // b2RTaWdQQ0FfMDgtMzEtMjAxMC5jcmwwWgYIKwYBBQUH
// SIG // AQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY0NvZFNpZ1BD
// SIG // QV8wOC0zMS0yMDEwLmNydDANBgkqhkiG9w0BAQUFAAOC
// SIG // AQEApqhTkd87Af5hXQZa62bwDNj32YTTAFEOENGk0Rco
// SIG // 54wzOCvYQ8YDi3XrM5L0qeJn/QLbpR1OQ0VdG0nj4E8W
// SIG // 8H6P8IgRyoKtpPumqV/1l2DIe8S/fJtp7R+CwfHNjnhL
// SIG // YvXXDRzXUxLWllLvNb0ZjqBAk6EKpS0WnMJGdAjr2/TY
// SIG // pUk2VBIRVQOzexb7R/77aPzARVziPxJ5M6LvgsXeQBkH
// SIG // 7hXFCptZBUGp0JeegZ4DW/xK4xouBaxQRy+M+nnYHiD4
// SIG // BfspaxgU+nIEtwunmmTsEV1PRUmNKRot+9C2CVNfNJTg
// SIG // FsS56nM16Ffv4esWwxjHBrM7z2GE4rZEiZSjhjCCBbww
// SIG // ggOkoAMCAQICCmEzJhoAAAAAADEwDQYJKoZIhvcNAQEF
// SIG // BQAwXzETMBEGCgmSJomT8ixkARkWA2NvbTEZMBcGCgmS
// SIG // JomT8ixkARkWCW1pY3Jvc29mdDEtMCsGA1UEAxMkTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // MB4XDTEwMDgzMTIyMTkzMloXDTIwMDgzMTIyMjkzMlow
// SIG // eTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWlj
// SIG // cm9zb2Z0IENvZGUgU2lnbmluZyBQQ0EwggEiMA0GCSqG
// SIG // SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCycllcGTBkvx2a
// SIG // YCAgQpl2U2w+G9ZvzMvx6mv+lxYQ4N86dIMaty+gMuz/
// SIG // 3sJCTiPVcgDbNVcKicquIEn08GisTUuNpb15S3GbRwfa
// SIG // /SXfnXWIz6pzRH/XgdvzvfI2pMlcRdyvrT3gKGiXGqel
// SIG // cnNW8ReU5P01lHKg1nZfHndFg4U4FtBzWwW6Z1KNpbJp
// SIG // L9oZC/6SdCnidi9U3RQwWfjSjWL9y8lfRjFQuScT5EAw
// SIG // z3IpECgixzdOPaAyPZDNoTgGhVxOVoIoKgUyt0vXT2Pn
// SIG // 0i1i8UU956wIAPZGoZ7RW4wmU+h6qkryRs83PDietHdc
// SIG // pReejcsRj1Y8wawJXwPTAgMBAAGjggFeMIIBWjAPBgNV
// SIG // HRMBAf8EBTADAQH/MB0GA1UdDgQWBBTLEejK0rQWWAHJ
// SIG // Ny4zFha5TJoKHzALBgNVHQ8EBAMCAYYwEgYJKwYBBAGC
// SIG // NxUBBAUCAwEAATAjBgkrBgEEAYI3FQIEFgQU/dExTtMm
// SIG // ipXhmGA7qDFvpjy82C0wGQYJKwYBBAGCNxQCBAweCgBT
// SIG // AHUAYgBDAEEwHwYDVR0jBBgwFoAUDqyCYEBWJ5flJRP8
// SIG // KuEKU5VZ5KQwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvbWljcm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUF
// SIG // BwEBBEgwRjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRS
// SIG // b290Q2VydC5jcnQwDQYJKoZIhvcNAQEFBQADggIBAFk5
// SIG // Pn8mRq/rb0CxMrVq6w4vbqhJ9+tfde1MOy3XQ60L/svp
// SIG // LTGjI8x8UJiAIV2sPS9MuqKoVpzjcLu4tPh5tUly9z7q
// SIG // QX/K4QwXaculnCAt+gtQxFbNLeNK0rxw56gNogOlVuC4
// SIG // iktX8pVCnPHz7+7jhh80PLhWmvBTI4UqpIIck+KUBx3y
// SIG // 4k74jKHK6BOlkU7IG9KPcpUqcW2bGvgc8FPWZ8wi/1wd
// SIG // zaKMvSeyeWNWRKJRzfnpo1hW3ZsCRUQvX/TartSCMm78
// SIG // pJUT5Otp56miLL7IKxAOZY6Z2/Wi+hImCWU4lPF6H0q7
// SIG // 0eFW6NB4lhhcyTUWX92THUmOLb6tNEQc7hAVGgBd3TVb
// SIG // Ic6YxwnuhQ6MT20OE049fClInHLR82zKwexwo1eSV32U
// SIG // jaAbSANa98+jZwp0pTbtLS8XyOZyNxL0b7E8Z4L5UrKN
// SIG // MxZlHg6K3RDeZPRvzkbU0xfpecQEtNP7LN8fip6sCvsT
// SIG // J0Ct5PnhqX9GuwdgR2VgQE6wQuxO7bN2edgKNAltHIAx
// SIG // H+IOVN3lofvlRxCtZJj/UBYufL8FIXrilUEnacOTj5XJ
// SIG // jdibIa4NXJzwoq6GaIMMai27dmsAHZat8hZ79haDJLmI
// SIG // z2qoRzEvmtzjcT3XAH5iR9HOiMm4GPoOco3Boz2vAkBq
// SIG // /2mbluIQqBC0N1AI1sM9MIIGBzCCA++gAwIBAgIKYRZo
// SIG // NAAAAAAAHDANBgkqhkiG9w0BAQUFADBfMRMwEQYKCZIm
// SIG // iZPyLGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJbWlj
// SIG // cm9zb2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9vdCBD
// SIG // ZXJ0aWZpY2F0ZSBBdXRob3JpdHkwHhcNMDcwNDAzMTI1
// SIG // MzA5WhcNMjEwNDAzMTMwMzA5WjB3MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSEwHwYDVQQDExhNaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
// SIG // ggEKAoIBAQCfoWyx39tIkip8ay4Z4b3i48WZUSNQrc7d
// SIG // GE4kD+7Rp9FMrXQwIBHrB9VUlRVJlBtCkq6YXDAm2gBr
// SIG // 6Hu97IkHD/cOBJjwicwfyzMkh53y9GccLPx754gd6udO
// SIG // o6HBI1PKjfpFzwnQXq/QsEIEovmmbJNn1yjcRlOwhtDl
// SIG // KEYuJ6yGT1VSDOQDLPtqkJAwbofzWTCd+n7Wl7PoIZd+
// SIG // +NIT8wi3U21StEWQn0gASkdmEScpZqiX5NMGgUqi+YSn
// SIG // EUcUCYKfhO1VeP4Bmh1QCIUAEDBG7bfeI0a7xC1Un68e
// SIG // eEExd8yb3zuDk6FhArUdDbH895uyAc4iS1T/+QXDwiAL
// SIG // AgMBAAGjggGrMIIBpzAPBgNVHRMBAf8EBTADAQH/MB0G
// SIG // A1UdDgQWBBQjNPjZUkZwCu1A+3b7syuwwzWzDzALBgNV
// SIG // HQ8EBAMCAYYwEAYJKwYBBAGCNxUBBAMCAQAwgZgGA1Ud
// SIG // IwSBkDCBjYAUDqyCYEBWJ5flJRP8KuEKU5VZ5KShY6Rh
// SIG // MF8xEzARBgoJkiaJk/IsZAEZFgNjb20xGTAXBgoJkiaJ
// SIG // k/IsZAEZFgltaWNyb3NvZnQxLTArBgNVBAMTJE1pY3Jv
// SIG // c29mdCBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eYIQ
// SIG // ea0WoUqgpa1Mc1j0BxMuZTBQBgNVHR8ESTBHMEWgQ6BB
// SIG // hj9odHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9taWNyb3NvZnRyb290Y2VydC5jcmww
// SIG // VAYIKwYBBQUHAQEESDBGMEQGCCsGAQUFBzAChjhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01p
// SIG // Y3Jvc29mdFJvb3RDZXJ0LmNydDATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDCDANBgkqhkiG9w0BAQUFAAOCAgEAEJeKw1wD
// SIG // RDbd6bStd9vOeVFNAbEudHFbbQwTq86+e4+4LtQSooxt
// SIG // YrhXAstOIBNQmd16QOJXu69YmhzhHQGGrLt48ovQ7DsB
// SIG // 7uK+jwoFyI1I4vBTFd1Pq5Lk541q1YDB5pTyBi+FA+mR
// SIG // KiQicPv2/OR4mS4N9wficLwYTp2OawpylbihOZxnLcVR
// SIG // DupiXD8WmIsgP+IHGjL5zDFKdjE9K3ILyOpwPf+FChPf
// SIG // wgphjvDXuBfrTot/xTUrXqO/67x9C0J71FNyIe4wyrt4
// SIG // ZVxbARcKFA7S2hSY9Ty5ZlizLS/n+YWGzFFW6J1wlGys
// SIG // OUzU9nm/qhh6YinvopspNAZ3GmLJPR5tH4LwC8csu89D
// SIG // s+X57H2146SodDW4TsVxIxImdgs8UoxxWkZDFLyzs7BN
// SIG // Z8ifQv+AeSGAnhUwZuhCEl4ayJ4iIdBD6Svpu/RIzCzU
// SIG // 2DKATCYqSCRfWupW76bemZ3KOm+9gSd0BhHudiG/m4LB
// SIG // J1S2sWo9iaF2YbRuoROmv6pH8BJv/YoybLL+31HIjCPJ
// SIG // Zr2dHYcSZAI9La9Zj7jkIeW1sMpjtHhUBdRBLlCslLCl
// SIG // eKuzoJZ1GtmShxN1Ii8yqAhuoFuMJb+g74TKIdbrHk/J
// SIG // mu5J4PcBZW+JC33Iacjmbuqnl84xKf8OxVtc2E0bodj6
// SIG // L54/LlUWa8kTo/0xggTSMIIEzgIBATCBkDB5MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSMwIQYDVQQDExpNaWNyb3NvZnQg
// SIG // Q29kZSBTaWduaW5nIFBDQQITMwAAAQosea7XeXumrAAB
// SIG // AAABCjAJBgUrDgMCGgUAoIHrMBkGCSqGSIb3DQEJAzEM
// SIG // BgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgor
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBQLBmFWc5qc
// SIG // 1RRzEE9wMBEK+s1A1DCBigYKKwYBBAGCNwIBDDF8MHqg
// SIG // YIBeAGQAZQBmAGEAdQBsAHQAXwBhADkAMgA5AGUAMAA2
// SIG // ADgALQA4ADcANwBlAC0ANAA3AGMAYgAtAGIANQA3AGIA
// SIG // LQA2AGMAZQA3ADcAOQA4ADkANQA5AGIAMQAuAGoAc6EW
// SIG // gBRodHRwOi8vbWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQBO7mPpEXE8MHnltA+yjBUTbl7yxhVyp9YN
// SIG // zSBuhvjqBozDkX8DS1UHZ1Ot41mtW9xO13y249ryST/E
// SIG // 2z5AM3PUhu5WT4q+tl9S2BCe+7lGdmblBf+OuofgKdtl
// SIG // oFW63V5knwnMCJJ8IY/Syxk8noN0p8UaoQyEpRE/3VzF
// SIG // MzRupDprPm7apOX1RMcHbfPkjqYaJzKt120yqWNPmH2q
// SIG // OIQeseY7AIBRCtX4VgS5jkd396lYYofmqBWF67+IRrfQ
// SIG // sqPGjS2mp6VWuUpLtMX+t4Weafsmsb131KQM8jxUMzi5
// SIG // 4MdXEfcGQlQVUUdjvTtDwfZml9WIlmoNcg6spjZo/s73
// SIG // oYICKDCCAiQGCSqGSIb3DQEJBjGCAhUwggIRAgEBMIGO
// SIG // MHcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQQITMwAAAJvgdDfL
// SIG // PU2NLgAAAAAAmzAJBgUrDgMCGgUAoF0wGAYJKoZIhvcN
// SIG // AQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcN
// SIG // MTYwNjIwMjIwNDQwWjAjBgkqhkiG9w0BCQQxFgQU0FOe
// SIG // T2dfOQr9oT8qDeoRJLno28gwDQYJKoZIhvcNAQEFBQAE
// SIG // ggEAClZxP8UYoXhhu2TuNtY1Eza1hov8UVKtOGdwA+MQ
// SIG // /tVJlMCc9UWQ3ibh5rPhR+/oNXbfhIBM3j3IJgWSunuG
// SIG // ritKmDWvenk42tqLBVFQMlwgHeWLqeXo0No0R8oxf7BL
// SIG // LU0b8sP/6kEchcz8aj4ni2DbKCJ+5CBA0m/dxAaqDmpg
// SIG // +TsE9voth9pHpNj9Nx3NgDZuMhIWrneMOJdxHBwYMbZv
// SIG // LqdyFuYbNOWPgZdh5C5uTfpLGy+kpVaONEqOkyl3XiNc
// SIG // xFaBaWza4we1GI44tjrzB/EePeJbda5ehQ1MI2lvAkbI
// SIG // bjspl08Ee6u47f45B+V9zdyFLFGxRtKu6PCspQ==
// SIG // End signature block
