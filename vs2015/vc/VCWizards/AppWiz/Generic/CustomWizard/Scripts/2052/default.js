// Copyright (c) Microsoft Corporation. All rights reserved.

function OnFinish(selProj, selObj)
{
	try
	{
		var strProductPath = GetCustomWizardLocation();
		var strStartPath = wizard.FindSymbol("PROJECT_PATH");
		var strWizardName = wizard.FindSymbol("CUSTOM_WIZARD_NAME");

		wizard.AddSymbol("TAB_ARRAYS", "");

		var nPages = wizard.FindSymbol("NUM_OF_PAGES");
		if (nPages > 1)
		{
			var strTabArrays = "var tab_array = new Array();\n";
			strTabArrays = strTabArrays + "tab_array[0] = Default;\n";
			for (n = 1; n < nPages; n++)
			{
				strTabArrays = strTabArrays + "tab_array[" + n + "] = Page_" + (n+1) + ";\n";
			}
			wizard.AddSymbol("TAB_ARRAYS", strTabArrays);
		}

		selProj = CreateProject(strWizardName, strStartPath);
		selProj.Object.Keyword = "CustomAppWizProj";

		AddFilters(selProj);


		AddFilesToProjectWithInfFile(selProj, strWizardName);


		if (nPages > 1)
		{

			var strTemplatePath = wizard.FindSymbol("TEMPLATES_PATH");
			var strTemplateFile = strTemplatePath + "\\sample.htm";

			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_HTML_PATH");

			for (n = 2; n <= nPages; n++)
			{
				wizard.AddSymbol("CURRENT_PAGE", n);
				var strTarget = strPath + "\\Page_" + n.toString() + ".htm";
				wizard.RenderTemplate(strTemplateFile, strTarget);
				selProj.ProjectItems.AddFromFile(strTarget);
			}
		}

		var lConfigCount = selProj.Object.Configurations.Count;
		for (var i = 1; i <= lConfigCount; i++)
		{
			var config = selProj.Object.Configurations.Item(i);
			// set to 'Utility' so build does nothing
			config.ConfigurationType = typeGeneric;

			// This will set devenv.exe to be the executable for debugging session
			config.DebugSettings.Command = wizard.GetProcessName();

		}
		selProj.Object.Save();
		InstallFiles(strStartPath, strWizardName, strProductPath);
	}
	catch(e)
	{
		if (e.description.length != 0)
			SetErrorInfo(e);
		return e.number;
	}
}

function SetFileProperties(projfile, strName)
{
	return false;
}

function GetTargetName(strName, strWizardName, strResPath, strHelpPath)
{
	var strTarget = strName;

	switch(strName)
	{
		case "readme.txt":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_TEMPLATES_PATH");
			strTarget = strPath + "\\ReadMe.txt";
			break;
		}
		case "sample.txt":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_TEMPLATES_PATH");
			strTarget = strPath + "\\Sample.txt";
			break;
		}
		case "customwiz.inf":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_TEMPLATES_PATH");
			strTarget = strPath + "\\Templates.inf";
			break;
		}
		case "customwiz.htm":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_HTML_PATH");
			strTarget = strPath + "\\default.htm";
			break;
		}
		case "Custom.gif":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_IMAGES_PATH");
			strTarget = strPath + "\\" + strWizardName + ".gif";
			break;
		}
		case "Custom_Background.gif":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_IMAGES_PATH");
			strTarget = strPath + "\\" + strWizardName + "_Background.gif";
			break;
		}
		case "customwiz.vsz":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strTarget = strPath + "\\" + strWizardName + ".vsz";
			break;
		}
		case "customwiz.vcxproj":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strTarget = strPath + "\\default.vcxproj";
			break;
		}
		case "customwiz.ico":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strTarget = strPath + "\\" + strWizardName + ".ico";
			break;
		}
		case "customwiz.vsdir":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strTarget = strPath + "\\" + strWizardName + ".vsdir";
			break;
		}
		case "customwiz.css":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strLocale = wizard.GetHostLocale();
			strTarget = strPath + "\\" + strLocale + "\\NewStyles.css";
			break;
		}
		case "styles.css":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strLocale = wizard.GetHostLocale();
			strTarget = strPath + "\\" + strLocale + "\\styles.css";
			break;
		}
		case "DottedHori.gif":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strLocale = wizard.GetHostLocale();
			strTarget = strPath + "\\" + strLocale + "\\Images" + "\\DottedHori.gif";
			break;
		}
		case "DottedVert.gif":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strLocale = wizard.GetHostLocale();
			strTarget = strPath + "\\" + strLocale + "\\Images" + "\\DottedVert.gif";
			break;
		}
		case "spacer.gif":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_START_PATH");
			strLocale = wizard.GetHostLocale();
			strTarget = strPath + "\\" + strLocale + "\\Images" + "\\spacer.gif";
			break;
		}
		case "customwiz.js":
		{
			var strPath = wizard.FindSymbol("CUSTOM_WIZARD_SCRIPT_PATH");
			strTarget = strPath + "\\default.js";
			break;
		}
		default:
			break;
	}
	return strTarget;
}

function AddFilters(selProj)
{
	var strTemplateFilter = wizard.FindSymbol("TEMPLATE_FILTER");
    var L_strTemplate_Text = "模板文件";
	var group = selProj.Object.AddFilter(L_strTemplate_Text);
	group.Filter = strTemplateFilter;

	var strHTMLFilter = wizard.FindSymbol("HTML_FILTER");
    var L_strHTML_Text = "HTML 文件";
	group = selProj.Object.AddFilter(L_strHTML_Text);
	group.Filter = strHTMLFilter;

	var strImageFilter = wizard.FindSymbol("IMAGE_FILTER");
    var L_strImage_Text = "图像文件";
	group = selProj.Object.AddFilter(L_strImage_Text);
	group.Filter = strImageFilter;

	var strScriptFilter = wizard.FindSymbol("SCRIPT_FILTER");
    var L_strScript_Text = "脚本文件";
	group = selProj.Object.AddFilter(L_strScript_Text);
	group.Filter = strScriptFilter;

	var strScriptFilter = wizard.FindSymbol("MISC_FILTER");
    var L_strMisc_Text = "杂项文件";
	group = selProj.Object.AddFilter(L_strMisc_Text);
	group.Filter = strScriptFilter;
}

// Copy the vsz, vsdir and ico files to the installation dir
//
function InstallFiles(strStartPath, strWizardName, strProductPath)
{
	try
	{
		var oFSO = new ActiveXObject("Scripting.FileSystemObject");

		var strSourcePath = strStartPath + "\\" + strWizardName + ".vsz";
		var strTargetPath = strProductPath + "\\" + strWizardName + ".vsz";

		oFSO.CopyFile(strSourcePath, strTargetPath);

		var strSourcePath = strStartPath + "\\" + strWizardName + ".vsdir";
		var strTargetPath = strProductPath + "\\" + strWizardName + ".vsdir";

		oFSO.CopyFile(strSourcePath, strTargetPath);

		var strSourcePath = strStartPath + "\\" + strWizardName + ".ico";
		var strTargetPath = strProductPath + "\\" + strWizardName + ".ico";

		oFSO.CopyFile(strSourcePath, strTargetPath);
	}
	catch(e)
	{
		throw(e);
	}
}


// SIG // Begin signature block
// SIG // MIIa6AYJKoZIhvcNAQcCoIIa2TCCGtUCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFF2zyoyg4qF0
// SIG // hS4pQ+v+zv+53LsOoIIVgjCCBMMwggOroAMCAQICEzMA
// SIG // AACc7v4UValdNVAAAAAAAJwwDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE2MDMzMDE5
// SIG // MjEzMFoXDTE3MDYzMDE5MjEzMFowgbMxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjo1ODQ3LUY3NjEtNEY3MDEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAMwlhsl+iHoEj/vklU9epTLAab6xrU1GWdPtri0X
// SIG // lXXCMHd2091EB93Uff8GMa0sSf786tMU1N48+M230myS
// SIG // iD2LhwqTOH+Wtrc7v555A64ftHgB3Tc7LuyveruJiWU7
// SIG // iGI15VE7d64pXCwmFZs4K9MbvbPBtBKuu76g8rl7jG2p
// SIG // 8o7lEj/f2zhzZtxVW0XTnLCg2y34ziccn4ieu78n2xHP
// SIG // emwVbpUZv+hTb1+ewejzeMMwiURNM4oQLKdHRDqDccaW
// SIG // dOU+iQbhgUshhWzdmlwnrRfbPvS0ezij1zAE4GnvjMtG
// SIG // xRLA8t7CfM/J1FW7ktvNOThFdvqZVRFYbMQsiYkCAwEA
// SIG // AaOCAQkwggEFMB0GA1UdDgQWBBQ9XziJKANTiL5XmMZp
// SIG // /vYFXJZLLjAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA0GCSqGSIb3DQEBBQUAA4IBAQBW9mryWArT
// SIG // QwTRt58bLNWamRLKYRBK7V4/jFUv0R3jt027EwgUYa/L
// SIG // EWspXTacTuw6feQf/Ov68BRuktDg4eLL7sMBFl+oSuK7
// SIG // 4rT4+rVGDt3ZL4likaHyLofibFnlxCHa9893BvwIQrq8
// SIG // OOyT+j2l5f7tesai2vrhS7krO3Le7H+DoJM+bvZc9/9K
// SIG // +WyVFpHqY9wXqNLTBX0rql19kWdzw3WNHzkui86g8mw1
// SIG // T4ez07TsJEHqKzpEAv/8j5vIJsr+h+Hp19UdUcDPtExi
// SIG // XXJKoIcLFLYxTLZ2axLwxuFSwOqwzpSNPG8sWnYUGupP
// SIG // TBbE37m8UOHC2xm7iFh+XejuMIIE7DCCA9SgAwIBAgIT
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
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBSrlCZxT7dw
// SIG // znH5bEynSFQT8OT3RjCBigYKKwYBBAGCNwIBDDF8MHqg
// SIG // YIBeAGQAZQBmAGEAdQBsAHQAXwBkADUAYQA4ADYAYQBj
// SIG // AGQALQAwAGYAZQA0AC0ANAAzADIAMQAtAGIAZgA4AGQA
// SIG // LQBiAGQAOQAyAGMAOQAwADUANQBlAGUAMgAuAGoAc6EW
// SIG // gBRodHRwOi8vbWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQCBfecg6V1FY2arbUeyslKppJwM/XD7XMyd
// SIG // jdIT0PF9RyqpMUHWE7dQYRAseUCE4jGmLkIWSF+kW6VY
// SIG // DdAHgLz8cplR2Oai0ygQ80PsRcYk8Zgz00utRYYvA3GV
// SIG // nVWaYMjUjkJINLoDu2Z+eXc43aI8TS3BeUIU4HVoArcV
// SIG // plwVLVyiQbV54t0+6o4UDgpe7QpbVs+lF6Fso5j6rL44
// SIG // SG2G2qObySWZIawJnUa3Oa4U6IJxfbA9rhkmm0zqX+oG
// SIG // 0m+0gRRepx/VujzzfAN6NGdDn9PhqFZebfzkBoZEdpDG
// SIG // qCtL+V2fxNh39QK11eNEAhj7f4xGkiK6aBNCDgcvzieG
// SIG // oYICKDCCAiQGCSqGSIb3DQEJBjGCAhUwggIRAgEBMIGO
// SIG // MHcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQQITMwAAAJzu/hRV
// SIG // qV01UAAAAAAAnDAJBgUrDgMCGgUAoF0wGAYJKoZIhvcN
// SIG // AQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcN
// SIG // MTYwNjIwMjIwNDA3WjAjBgkqhkiG9w0BCQQxFgQUFVHv
// SIG // qXCHA+iiZJO1F01RpMk55wowDQYJKoZIhvcNAQEFBQAE
// SIG // ggEAJMEuklWWjLyx2Mc6WIcdNTAyh4KwrmlkC6ti4pj7
// SIG // Ce9v1rXInuGbIUNMDjK1qBkrAtSyP+mmRRIZB9cPnQvT
// SIG // 1SSa08c5UOkfW2XJZI+nNYNsYGbOQoGiSpuUXaW7Q+zf
// SIG // vVTV0RjAOTkHpYt+pYMqfhvHHvXjEqIgpbqcoM1Te8QW
// SIG // zNWb7fL1BTvPOOl8NihKg4kTTmYAtO6mOsUxsX0ISvGK
// SIG // CKwziM4kwEm0Ms9isk/9i5Q2qd2xiHQ34kbYu7lydoEZ
// SIG // 2v14sXpjlh8cyRS7++H/UZMb3MbQjqnLVkhtvnCiLDpQ
// SIG // f0I/NkRV00tlgWx5YHWr785NQnjtpCvduzaFIg==
// SIG // End signature block
