// Copyright (c) Microsoft Corporation. All rights reserved.
// Script for ATL Property Page

function OnPrep(selProj, selObj)
{
	var L_WizardDialogTitle_Text = "ATL 属性页向导";
	return PrepCodeWizard(selProj, L_WizardDialogTitle_Text);
}

function OnFinish(selProj, selObj)
{
	var oCM;
	try
	{
		oCM	= selProj.CodeModel;
		var bDevice  = IsDeviceProject(selProj);

		wizard.AddSymbol("DEVICE", bDevice);
		
		// used only for device projects where platforms may not support DCOM.
		wizard.AddSymbol("SUPPORT_DCOM", false);
		wizard.AddSymbol("SUPPORT_NON_DCOM", false);

		SetResDlgFont();

		if (!bAttributed)
		{
			var MidlTool = GetIDLConfig(selProj,true);
			var strMidlHeader = MidlTool.HeaderFileName;
			strMidlHeader = selProj.Object.Configurations(1).Evaluate(strMidlHeader);
			wizard.AddSymbol("MIDL_H_FILENAME",strMidlHeader);
		}

		if (!bDevice)
		{
			var strShortName = wizard.FindSymbol("SHORT_NAME");
			var L_TRANSACTION_Text = "添加 ATL 属性页 ";
			oCM.StartTransaction(L_TRANSACTION_Text + strShortName);
			if(!AddATLSupportToProject(selProj))
			{
				oCM.AbortTransaction();
				return;
			}

			var bDLL;
			if (typeDynamicLibrary == selProj.Object.Configurations(1).ConfigurationType)
				bDLL = true;
			else
				bDLL = false;
			wizard.AddSymbol("DLL_APP", bDLL);

			var strProjectName		= wizard.FindSymbol("PROJECT_NAME");
			var strProjectPath		= wizard.FindSymbol("PROJECT_PATH");
			var strTemplatePath		= wizard.FindSymbol("TEMPLATES_PATH");
			var strUpperShortName	= CreateASCIIName(strShortName.toUpperCase());
			strUpperShortName		= CreateSafeName(strUpperShortName); 
			wizard.AddSymbol("UPPER_SHORT_NAME", strUpperShortName);
			var strVIProgID			= wizard.FindSymbol("VERSION_INDEPENDENT_PROGID");
			if (strVIProgID == null || strVIProgID == "")
			{
				wizard.AddSymbol("PROGID_VALID", false);
				wizard.AddSymbol("VERSION_INDEPENDENT_PROGID","");
				wizard.AddSymbol("PROGID","");
			}
			else
			{
				wizard.AddSymbol("PROGID_VALID", true);
				wizard.AddSymbol("PROGID", strVIProgID.substr(0,37) + ".1");
			}
			var strClassName		= wizard.FindSymbol("CLASS_NAME");
			var strHeaderFile		= wizard.FindSymbol("HEADER_FILE");
			var strImplFile			= wizard.FindSymbol("IMPL_FILE");
			var strCoClass			= wizard.FindSymbol("COCLASS");
			var bAttributed			= wizard.FindSymbol("ATTRIBUTED");

			var strProjectRC		= GetProjectFile(selProj, "RC", true, false);

			var strProjectH			= GetProjectFile(selProj, "H", false, IsMFCProject(selProj,false));
			wizard.AddSymbol("PROJECT_HEADER_NAME", strProjectH);

			// Create necessary GUIDS
			CreateGUIDs();

			// open resource file
			var oResHelper = wizard.ResourceHelper;
			oResHelper.OpenResourceFile(strProjectRC);

			if (!bAttributed)
			{
				// Get LibName
				wizard.AddSymbol("LIB_NAME", oCM.IDLLibraries(1).Name);

				// Get LibID
				wizard.AddSymbol("LIBID_REGISTRY_FORMAT", oCM.IDLLibraries(1).Attributes.Find("uuid").Value);

				// Get typelib version
				var oVersion = oCM.IDLLibraries(1).Attributes.Find("version");
				if (oVersion)
				{
					var aryMajorMinor = oVersion.Value.split('.');
					for (var nCntr=0; nCntr<aryMajorMinor.length; nCntr++)
					{
						if (nCntr == 0)
							wizard.AddSymbol("TYPELIB_VERSION_MAJOR", aryMajorMinor[nCntr]);
						else
							wizard.AddSymbol("TYPELIB_VERSION_MINOR", aryMajorMinor[nCntr]);
					}
				}

				// Get AppID
				var strAppID = wizard.GetAppID();
				if (strAppID.length > 0)
				{
					wizard.AddSymbol("APPID_EXIST", true);
					wizard.AddSymbol("APPID_REGISTRY_FORMAT", strAppID);
				}

				// Render proppageco.idl and insert into strProject.idl
				AddCoclassFromFile(oCM, "proppageco.idl");

				SetMergeProxySymbol(selProj);
			}

			var strDLGID = "IDD_" + strUpperShortName;			
			var strRCTemplate = strTemplatePath + "\\propdlg.rc";
			var strRCTemplFile = RenderToTemporaryResourceFile(strRCTemplate);
			var strSymbolValue = oResHelper.AddResource(strDLGID, strRCTemplFile, "DIALOG");
			if (strSymbolValue == null) return;				
			wizard.AddSymbol("IDD_DIALOGID", strSymbolValue.split("=").shift());

			var strTitleID = "IDS_TITLE" + strUpperShortName;
			strSymbolValue = oResHelper.AddResource(strTitleID, wizard.FindSymbol("TITLE"), "STRING");
			if (strSymbolValue == null) return;				
			wizard.AddSymbol("IDS_TITLE", strSymbolValue.split("=").shift());

			var strHelpFileID = "IDS_HELPFILE" + strUpperShortName;
			strSymbolValue = oResHelper.AddResource(strHelpFileID, wizard.FindSymbol("HELP_FILE"), "STRING");
			if (strSymbolValue == null) return;				
			wizard.AddSymbol("IDS_HELPFILE", strSymbolValue.split("=").shift());

			var strDocStringID = "IDS_DOCSTRING" + strUpperShortName;
			strSymbolValue = oResHelper.AddResource(strDocStringID, wizard.FindSymbol("DOC_STRING"), "STRING");
			if (strSymbolValue == null) return;				
			wizard.AddSymbol("IDS_DOCSTRING", strSymbolValue.split("=").shift());

			// Add #include <atlcom.h> to stdafx.h
			if (!DoesIncludeExist(selProj, '<atlcom.h>', "stdafx.h"))
				oCM.AddInclude('<atlcom.h>', "stdafx.h", vsCMAddPositionEnd);
			// Add #include <atlctl.h> to stdafx.h
			if (!DoesIncludeExist(selProj, '<atlctl.h>', "stdafx.h"))
				oCM.AddInclude('<atlctl.h>', "stdafx.h", vsCMAddPositionEnd);


			if (!bAttributed)
			{
				// add RGS file resource
				var strRGSFile = GetUniqueFileName(strProjectPath, CreateASCIIName(strShortName) + ".rgs");
				RenderAddTemplate(wizard, "proppage.rgs", strRGSFile, false, false);
				var strRGSID = "IDR_" + strUpperShortName;
				strSymbolValue = oResHelper.AddResource(strRGSID, strProjectPath + strRGSFile, "REGISTRY");
				if (strSymbolValue == null) return;				
				wizard.AddSymbol("RGS_ID", strSymbolValue.split("=").shift());
			}
			// close resource file
			oResHelper.CloseResourceFile();
		}
		else
		{
			var strShortName = wizard.FindSymbol("SHORT_NAME");
			var L_TRANSACTION_Text = "添加 ATL 属性页 ";
			oCM.StartTransaction(L_TRANSACTION_Text + strShortName);
			if(!AddATLSupportToProject(selProj))
			{
				oCM.AbortTransaction();
				return;
			}

			var bDLL;
			if (typeDynamicLibrary == selProj.Object.Configurations(1).ConfigurationType)
				bDLL = true;
			else
				bDLL = false;
			wizard.AddSymbol("DLL_APP", bDLL);

			var strProjectName		= wizard.FindSymbol("PROJECT_NAME");
			var strProjectPath		= wizard.FindSymbol("PROJECT_PATH");
			var strTemplatePath		= wizard.FindSymbol("TEMPLATES_PATH");
			var strUpperShortName		= strShortName.toUpperCase();
			strUpperShortName		= CreateSafeName(strUpperShortName); 
			wizard.AddSymbol("UPPER_SHORT_NAME", strUpperShortName);
			var strVIProgID			= wizard.FindSymbol("VERSION_INDEPENDENT_PROGID");
			wizard.AddSymbol("PROGID", strVIProgID.substr(0,37) + ".1");
			var strClassName		= wizard.FindSymbol("CLASS_NAME");
			var strHeaderFile		= wizard.FindSymbol("HEADER_FILE");
			var strImplFile			= wizard.FindSymbol("IMPL_FILE");
			var strCoClass			= wizard.FindSymbol("COCLASS");
			var bAttributed			= wizard.FindSymbol("ATTRIBUTED");
			var strProjectH			= GetProjectFile(selProj, "H", false, IsMFCProject(selProj,false));
			wizard.AddSymbol("PROJECT_HEADER_NAME", strProjectH);
			var strRGSFile = GetUniqueFileName(strProjectPath, CreateASCIIName(strShortName) + ".rgs");
			var strRGSID = "IDR_" + strUpperShortName;
			var strRGSDCOMFile = GetUniqueFileName(strProjectPath, CreateASCIIName(strShortName + "DCOM") + ".rgs");;
			var strRGSDCOMID = "IDR_" + strUpperShortName + "DCOM";

			// Create necessary GUIDS
			CreateGUIDs();

			if (!bAttributed)
			{
				// Get LibName
				wizard.AddSymbol("LIB_NAME", oCM.IDLLibraries(1).Name);

				// Get LibID
				wizard.AddSymbol("LIBID_REGISTRY_FORMAT", oCM.IDLLibraries(1).Attributes.Find("uuid").Value);

				// Get AppID
				var strAppID = wizard.GetAppID();
				if (strAppID.length > 0)
				{
					wizard.AddSymbol("APPID_EXIST", true);
					wizard.AddSymbol("APPID_REGISTRY_FORMAT", strAppID);
				}

				// Render proppageco.idl and insert into strProject.idl
				AddCoclassFromFile(oCM, "proppageco.idl");

				SetMergeProxySymbol(selProj);
			}


			// Add #include <atlcom.h> to stdafx.h
			if (!DoesIncludeExist(selProj, '<atlcom.h>', "stdafx.h"))
				oCM.AddInclude('<atlcom.h>', "stdafx.h", vsCMAddPositionEnd);
			// Add #include <atlctl.h> to stdafx.h
			if (!DoesIncludeExist(selProj, '<atlctl.h>', "stdafx.h"))
				oCM.AddInclude('<atlctl.h>', "stdafx.h", vsCMAddPositionEnd);

			var bDeviceDCOM = ProjectContainsDCOMPlatform(selProj)
			var bDeviceNonDCOM = ProjectContainsNonDCOMPlatform(selProj)


			if (!bAttributed)
			{
				// add RGS file resource
				if (bDeviceDCOM)
				{
					wizard.AddSymbol("SUPPORT_DCOM", true);
					RenderAddTemplate(wizard, "proppage.rgs", strRGSDCOMFile, false, false);
					wizard.AddSymbol("SUPPORT_DCOM", false);
				}
				if (bDeviceNonDCOM)
				{
					wizard.AddSymbol("SUPPORT_NON_DCOM", true);
					RenderAddTemplate(wizard, "proppage.rgs", strRGSFile, false, false);
					wizard.AddSymbol("SUPPORT_NON_DCOM", false);
				}
				var strRGSID = "IDR_" + strUpperShortName;
			}

			wizard.AddSymbol("SUPPORT_DCOM", bDeviceDCOM);
			wizard.AddSymbol("SUPPORT_NON_DCOM", bDeviceNonDCOM);

			var strDLGID = "IDD_" + strUpperShortName;			
			var configs = selProj.Object.Configurations;
			var completedResourceFiles = new Array();
			AddDeviceSymbols(false);

			var ProjWiz = new ActiveXObject("ProjWiz.SDProjWiz2.4");
			var oResHelper = wizard.ResourceHelper;

			for (var nCntr = 1; nCntr <= configs.Count; nCntr++)
			{
				var config = configs.Item(nCntr);
				var strCurrentResource = GetDeviceResourceFileForConfig(config);

				if (completedResourceFiles.join(";").indexOf(strCurrentResource) == -1)
				{
					var platformName = config.Platform.Name;
					var symbol = ProjWiz.GetBaseNativePlatformProperty(platformName, "UISymbol");

					// open resource file
					oResHelper.OpenResourceFile(strCurrentResource);

					// before we add the file to the project, render it to a temporary file. Then we 
					// can add the resulting preprocessed file to the current resource file. At which
					// point we delete the temporary file.
					var strRCTemplate = strTemplatePath;
					if (symbol == "POCKETPC2003_UI_MODEL")
					{
						strRCTemplate += "\\propdlgppc.rc";
					}
					else if (symbol == "SMARTPHONE2003_UI_MODEL")
					{
						strRCTemplate += "\\propdlgsp.rc";
					}
					else
					{
						strRCTemplate += "\\propdlgce.rc";
					}

					var strRCTemplFile = RenderToTemporaryResourceFile(strRCTemplate);

					var strCurrentSymbol = GetDeviceSymbolForConfig(config);
					wizard.AddSymbol(strCurrentSymbol, true);
					var strSymbolValue = oResHelper.AddResource(strDLGID, strRCTemplFile, "DIALOG");		
					if (strSymbolValue == null) return;				
					wizard.AddSymbol("IDD_DIALOGID", strSymbolValue.split("=").shift());

					var strTitleID = "IDS_TITLE" + strShortName;
					strSymbolValue = oResHelper.AddResource(strTitleID, wizard.FindSymbol("TITLE"), "STRING");
					if (strSymbolValue == null) return;				
					wizard.AddSymbol("IDS_TITLE", strSymbolValue.split("=").shift());

					var strHelpFileID = "IDS_HELPFILE" + strShortName;
					strSymbolValue = oResHelper.AddResource(strHelpFileID, wizard.FindSymbol("HELP_FILE"), "STRING");
					if (strSymbolValue == null) return;				
					wizard.AddSymbol("IDS_HELPFILE", strSymbolValue.split("=").shift());

					var strDocStringID = "IDS_DOCSTRING" + strShortName;
					strSymbolValue = oResHelper.AddResource(strDocStringID, wizard.FindSymbol("DOC_STRING"), "STRING");
					if (strSymbolValue == null) return;				
					wizard.AddSymbol("IDS_DOCSTRING", strSymbolValue.split("=").shift());
					
					if (!bAttributed)
					{
						if (bDeviceNonDCOM)
						{
							strSymbolValue = oResHelper.AddResource(strRGSID, strProjectPath + strRGSFile, "REGISTRY");
							if (strSymbolValue == null) return;				
							wizard.AddSymbol("RGS_ID", strSymbolValue.split("=").shift());	   
						}
						if (bDeviceDCOM)
						{
							strSymbolValue = oResHelper.AddResource(strRGSDCOMID, strProjectPath + strRGSDCOMFile, "REGISTRY");
							if (strSymbolValue == null) return;				
							wizard.AddSymbol("RGSDCOM_ID", strSymbolValue.split("=").shift());	
						}
					}

					// close resource file
					oResHelper.CloseResourceFile();
					completedResourceFiles.push(strCurrentResource);
				}
			}
		}

		// Add header
		RenderAddTemplate(wizard, "proppage.h", strHeaderFile, selObj, true);

		// Add CPP
		RenderAddTemplate(wizard, "proppage.cpp", strImplFile, selObj, false);

		oCM.CommitTransaction();
					
		var newClass = oCM.Classes.Find(strClassName);
		if(newClass)
			newClass.StartPoint.TryToShow(vsPaneShowTop);		

	}
	catch(e)
	{
		if (oCM)
			oCM.AbortTransaction();

		if (e.description.length != 0)
			SetErrorInfo(e);
		return e.number
	}
}

function CreateGUIDs()
{
	try
	{
		// create CLSID
		var strRawGUID = wizard.CreateGuid();
		var strFormattedGUID = wizard.FormatGuid(strRawGUID, 0);
		wizard.AddSymbol("CLSID_REGISTRY_FORMAT", strFormattedGUID);
	}
	catch(e)
	{
		throw e;
	}
}

// SIG // Begin signature block
// SIG // MIIa6AYJKoZIhvcNAQcCoIIa2TCCGtUCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFO70v1N7szjY
// SIG // NaL4VpIOWHyP2Pm+oIIVgjCCBMMwggOroAMCAQICEzMA
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
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBTkDCgVgtFQ
// SIG // 0WyTm2khX4Vsc8IbHjCBigYKKwYBBAGCNwIBDDF8MHqg
// SIG // YIBeAGQAZQBmAGEAdQBsAHQAXwBjADAAMAA1AGIAZgA0
// SIG // ADEALQBhADAAYwBjAC0ANABmADcAMgAtAGEAYwBlADcA
// SIG // LQAwADMAYQAxAGQAOABmADEAZgAwADUAYwAuAGoAc6EW
// SIG // gBRodHRwOi8vbWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQCKAyZEr+nAknbVkXfQDvgRxmOU4JQu/T8d
// SIG // 2rQwzGkNT+orkXLxWfc2Kf/SFXgDqvWrz/iUbvzeQDLi
// SIG // 2gh2/hD0xfaRyMDTLLuea3WDsqeoj7ejCWd+g0U4z1YT
// SIG // PubfaTj9D7JKIeEdCgjUpGXQ3oTKM4emt4FOdXy/6X7R
// SIG // oe71UnrCYCc4+vUThSOqZFkF0sTssKnP/GH+qOZs4hw1
// SIG // d43Z5vZB/y2r4LSPwK5TFs5fyjXKEXGM2cWhR0NUxA9i
// SIG // V5D4vRiQRj/AwrMzM7ptf7GmX9qgYqrk6p59kyeRQicu
// SIG // lG9UfXUC/rD3ONHuvlqIhbS2GZL9KWREOemIJa2qWDXa
// SIG // oYICKDCCAiQGCSqGSIb3DQEJBjGCAhUwggIRAgEBMIGO
// SIG // MHcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQQITMwAAAJzu/hRV
// SIG // qV01UAAAAAAAnDAJBgUrDgMCGgUAoF0wGAYJKoZIhvcN
// SIG // AQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcN
// SIG // MTYwNjIwMjIwNDA3WjAjBgkqhkiG9w0BCQQxFgQUpJcC
// SIG // Mwzlsm92DDatpunenDkg88IwDQYJKoZIhvcNAQEFBQAE
// SIG // ggEAUKyQggZlS1NfbiAU8FP62jnWjE1m/fyEYaMmtk06
// SIG // DrwdOEoJyzNwYEdlCnr5U0JrUyfroz2treAiR4UDZeUQ
// SIG // WjK2z7uxU4KJ9CVmhxIrue9ipep2XY/fa4EORb9nBwPs
// SIG // 5vp5JRiLe4f9p7N9JXV1TQfLtQ8vZQUG6pJfSPqDowxS
// SIG // Wx/rg/gg8UMdhfnrMJNIybCdXAZR0NP5aawUK08F5JDZ
// SIG // cHY05jfHd9OP7lPMkVQY+dLrmUnnY3tznOAoSWNYGBJL
// SIG // 9VtypbSvIiw3uGoZO8NI8gbOT3u4KIrtZhgSeh5ytsuU
// SIG // cL5lt3iNMqWnyZzfc5es7c0JMOUCMUu/qvhwVQ==
// SIG // End signature block
