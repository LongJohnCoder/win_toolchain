// Copyright (c) Microsoft Corporation. All rights reserved.

function OnFinish(selProj, selObj)
{
	try
	{
		var strProjectPath = wizard.FindSymbol("PROJECT_PATH");
		var strProjectName = wizard.FindSymbol("PROJECT_NAME");
		wizard.AddSymbol("SAFE_IDL_NAME", CreateASCIIName(wizard.FindSymbol("PROJECT_NAME")));
		wizard.AddSymbol("RC_FILE_NAME",CreateSafeRCFileName(wizard.FindSymbol("PROJECT_NAME")) + ".rc");

		selProj = CreateProject(strProjectName, strProjectPath);

		AddCommonConfig(selProj, strProjectName);
		AddSpecificConfig(selProj, strProjectName);
		selProj.Object.keyword = "MFCActiveXProj";

		SetupFilters(selProj);

		SetResDlgFont();

		AddFilesToProjectWithInfFile(selProj, strProjectName);
		SetCommonPchSettings(selProj);

		var Sdl = wizard.FindSymbol("SDL_CHECK");

		if (Sdl) 
		{
			EnableSDLCheckSettings(selProj);
		}

		selProj.Object.Save();
		
		AddHelpBuildSteps(selProj.Object, strProjectName);
	}
	catch(e)
	{
		if (e.description.length != 0)
			SetErrorInfo(e);
		return e.number
	}
}

function SetFileProperties(projfile, strName)
{
	return false;
}

function GetTargetName(strName, strProjectName, strResPath, strHelpPath)
{
	try
	{
		var strTarget = strName;
		if (strName.substr(0, 4) == "root")
		{
			if (strName == "root.idl")
			{
				var strProjectName = wizard.FindSymbol("SAFE_IDL_NAME");
				strTarget = strProjectName + ".idl";
			}
			else if (strName == "root.rc")
				strTarget = wizard.FindSymbol("RC_FILE_NAME");
			else
				strTarget = strProjectName + strName.substr(4);
			return strTarget;
		}

		switch (strName)
		{
			case "readme.txt":
				strTarget = "ReadMe.txt";
				break;
			case "resource.h":
				strTarget = "Resource.h";
				break;
			case "ctl.h":
				strTarget = wizard.FindSymbol("CONTROL_HEADER");
				break;
			case "ctl.cpp":
				strTarget = wizard.FindSymbol("CONTROL_IMPL");
				break;
			case "ppg.h":
				strTarget = wizard.FindSymbol("PROPERTY_PAGE_HEADER");
				break;
			case "ppg.cpp":
				strTarget = wizard.FindSymbol("PROPERTY_PAGE_IMPL");
				break;
			case "ctl.bmp":
				var strControlName = wizard.FindSymbol("SHORT_NAME");
				strTarget =  strControlName + "Ctrl.bmp";
				break;
			case "ctlcore.rtf":
				strTarget = strHelpPath + "\\" + strProjectName + ".rtf";
				break;
			case "bullet.bmp":
				strTarget = strHelpPath + "\\" + "Bullet.bmp";
				break;
			default:
				break;
		}
		return strTarget; 
	}
	catch(e)
	{
		throw e;
	}
}

function AddSpecificConfig(proj, strProjectName)
{
	try
	{
	var oConfigs = proj.Object.Configurations;
	for (var nCntr = 1; nCntr <= oConfigs.Count; nCntr++)
	{
		var config = oConfigs(nCntr);
		var bDebug = false;
		if (-1 != config.Name.indexOf("Debug"))
			bDebug = true;
	
		config.ConfigurationType = typeDynamicLibrary;
		config.UseOfMFC = useMfcDynamic;
		config.CharacterSet = charSetUNICODE;

		var CLTool = config.Tools("VCCLCompilerTool");
		var strDefines = CLTool.PreprocessorDefinitions;
		if (strDefines != "") strDefines += ";";
		strDefines += GetPlatformDefine(config);
		if(bDebug)
		{
			strDefines += "_WINDOWS;_DEBUG;_USRDLL";
		}			
		else
		{
			strDefines += "_WINDOWS;NDEBUG;_USRDLL";	
		}
		CLTool.PreprocessorDefinitions= strDefines;
		
		var MidlTool = config.Tools("VCMidlTool");
		var strIdlName = wizard.FindSymbol("SAFE_IDL_NAME");
		MidlTool.MkTypLibCompatible = false;
			
		// no /no_robust
		MidlTool.ValidateParameters = true;
		MidlTool.PreprocessorDefinitions = (bDebug ? "_DEBUG" : "NDEBUG");
		MidlTool.TypeLibraryName = "$(IntDir)" + strIdlName + ".tlb";
		MidlTool.HeaderFileName = "$(ProjectName)idl.h";

		var RCTool = config.Tools("VCResourceCompilerTool");
		RCTool.Culture = wizard.FindSymbol("LCID");
		RCTool.PreprocessorDefinitions = (bDebug ? "_DEBUG" : "NDEBUG");
		RCTool.AdditionalIncludeDirectories = "$(IntDir)";
		
		var LinkTool = config.Tools("VCLinkerTool");
		LinkTool.LinkIncremental = (bDebug ? linkIncrementalYes : linkIncrementalNo);
		
		var strDefFile = ".\\" + strProjectName + ".def";
		LinkTool.ModuleDefinitionFile = strDefFile;
		LinkTool.OutputFile = "$(OutDir)$(ProjectName).ocx";
		var GeneralRule = config.Rules.Item("ConfigurationGeneral");
		GeneralRule.SetPropertyValue("TargetExt", ".ocx");

		LinkTool.RegisterOutput = true;

		if (wizard.FindSymbol("RUNTIME_LICENSE"))
		{
			var PostBuildTool = config.Tools("VCPostBuildEventTool");
			var L_CopyingRuntimeLicense1_Text = "正在复制运行时许可证";
			PostBuildTool.Description = L_CopyingRuntimeLicense1_Text;
			PostBuildTool.CommandLine = 'copy "' + strProjectName + '.lic" "$(OutDir)"';
		}
	} //for
	} //try
	catch(e)
	{
		throw e;
	}
}

function AddHelpBuildSteps(projObj, strProjectName)
{
	try
	{
		var bHelpFiles = wizard.FindSymbol("HELP_FILES");
		
		if (!bHelpFiles)
			return;
			
		var fileExt;
		var fileTool1 = "";
		var fileTool2 = "";
		var outFileExt;
		
		fileExt = ".hpj";
		fileTool = "makehelp.bat";

		fileTool1 = "start /wait hcw /C /E /M \"$(ProjectName).hpj\"";

		var strCodeTool = new Array();
		strCodeTool[0] = "echo // ";
		var L_CodeFragment1_Text = "生成的帮助映射文件。  由 $(ProjectName).HPJ 使用。";
		strCodeTool[0] += L_CodeFragment1_Text + " > \"hlp\\$(ProjectName).hm\"";
		strCodeTool[1] = "echo. >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[2] = "echo // ";
		var L_CodeFragment2_Text = "命令(ID_* 和 IDM_*)";
		strCodeTool[2] += L_CodeFragment2_Text + " >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[3] = "makehm ID_,HID_,0x10000 IDM_,HIDM_,0x10000 \"%(FullPath)\" >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[4] = "echo. >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[5] = "echo // ";
		var L_CodeFragment3_Text = "提示(IDP_*)";
		strCodeTool[5] += L_CodeFragment3_Text + " >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[6] = "makehm IDP_,HIDP_,0x30000 \"%(FullPath)\" >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[7] = "echo. >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[8] = "echo // ";
		var L_CodeFragment4_Text = "资源(IDR_*)";
		strCodeTool[8] += L_CodeFragment4_Text + " >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[9] = "makehm IDR_,HIDR_,0x20000 \"%(FullPath)\" >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[10] = "echo. >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[11] = "echo // ";
		var L_CodeFragment5_Text = "对话框(IDD_*)";
		strCodeTool[11] += L_CodeFragment5_Text + " >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[12] = "makehm IDD_,HIDD_,0x20000 \"%(FullPath)\" >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[13] = "echo. >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[14] = "echo // ";
		var L_CodeFragment6_Text = "框架控件(IDW_*)";
		strCodeTool[14] += L_CodeFragment6_Text + " >> \"hlp\\$(ProjectName).hm\"";
		strCodeTool[15] = "makehm IDW_,HIDW_,0x50000 \"%(FullPath)\" >> \"hlp\\$(ProjectName).hm\"";
		for (var idx=0; idx<16; idx++)
			fileTool2 += strCodeTool[idx] + "\r\n";

		outFileExt = ".hlp";
		
		var fileObj1 = projObj.Files(strProjectName + fileExt);
		var fileObj2 = projObj.Files("resource.h");
		if (fileObj1 != null)
		{
			for (var i=1; i<=fileObj1.FileConfigurations.Count; i++)
			{
				var config = fileObj1.FileConfigurations.Item(i);
				if (config != null)
				{
					var CustomBuildTool = config.Tool;
					CustomBuildTool.AdditionalDependencies = ".\\hlp\\$(ProjectName).hm";
					CustomBuildTool.Outputs = ".\\$(ProjectName)" + outFileExt;
					CustomBuildTool.CommandLine = fileTool1;
					L_ToolDesc1_Text = "正在生成帮助文件...";
					CustomBuildTool.Description = L_ToolDesc1_Text;
				}
			}
		}
		if (fileObj2 != null)
		{
			for (var i=1; i<=fileObj2.FileConfigurations.Count; i++)
			{
				var config = fileObj2.FileConfigurations.Item(i);
				if (config != null)
				{
					var CustomBuildTool = config.Tool;
					CustomBuildTool.Outputs = ".\\hlp\\$(ProjectName).hm";
					CustomBuildTool.CommandLine = fileTool2;
					L_ToolDesc2_Text = "正在生成帮助编译器的映射文件...";
					CustomBuildTool.Description = L_ToolDesc2_Text;
				}
			}
		}
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
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFMxsxGoX6EPr
// SIG // thU2Lz3RnA/Go0vmoIIVgjCCBMMwggOroAMCAQICEzMA
// SIG // AACYBFjLfyMJsJ4AAAAAAJgwDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE2MDMzMDE5
// SIG // MjEyN1oXDTE3MDYzMDE5MjEyN1owgbMxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjo3QUZBLUU0MUMtRTE0MjEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBANY3JagEAe41WQrzrh+YxYsa0UxhbcDB8LNbBGWg
// SIG // N3IqG1SHViHo3OXwbt13cES38Y7JsqLtyXk2mvJagPdv
// SIG // atgMmfQN2QX8X/Fak8W7tOsAY+KOIOWArM9Av/NTdhEr
// SIG // EGW4w8W1ubCsw4YU9J086/NmnqXtXa40+Xb8lPwLxJAs
// SIG // 2hA1NHWU6tgZujSIn9dRswPjpA9G3WRvruBCUcpUOIo0
// SIG // rRoF1KQGqW9MtkbZQGL2UqS2M3hRXAP8kV2nAp6A/vof
// SIG // a+uoXv0nLxn3fyf+YT0QrYLGza97xScwVoFfc1apljr2
// SIG // QTxqS4Qi4JU4dLLT2v2cWY00v5yiS2uzGSHdd9UCAwEA
// SIG // AaOCAQkwggEFMB0GA1UdDgQWBBTzwiOf0r0ljb2o9Zwb
// SIG // 6Ehzu+mTwTAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA0GCSqGSIb3DQEBBQUAA4IBAQA/sT1SIRZd
// SIG // 9FxHt/a5YFKggq9n10faNGi9DoqGqeiwFDFyyuAfvy9n
// SIG // PgYFd9o6FOrzAoU2gPu1xMO6VwkTfrg/LpeInx63QDhB
// SIG // KjkwQ+zedtN7tizeuu/1mO9abqz9nszQdcvmAII2sBLe
// SIG // lY40HEhmfW0z0bUtiT0uQUvOvKWspt+ebtehzMcJoZb9
// SIG // ZJV+p31TrNQ2CuXGVKzwG5QmRFsxmm/I/XdmSBi0JkxJ
// SIG // krXbJTqu/b7oxCNJ6g5yQbrFBotvCodx89UCBzOVGYPx
// SIG // ebFoLdBKGxRh5pOCh9r63hmQK7QiAWpg3OXCCePJ2vRn
// SIG // wNo6iS1rG7zXMAuPOoOXGrsJMIIE7DCCA9SgAwIBAgIT
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
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBR8fdKtIhXU
// SIG // Uxb1RSmD4XzWKbbBWjCBigYKKwYBBAGCNwIBDDF8MHqg
// SIG // YIBeAGQAZQBmAGEAdQBsAHQAXwBlADcAOABhADcANwA0
// SIG // ADcALQA3AGEAZAAwAC0ANAA2AGEAOAAtAGEAOAA1AGQA
// SIG // LQA1ADYAYQAzADUANwA1AGQAYgA3ADEAZQAuAGoAc6EW
// SIG // gBRodHRwOi8vbWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQAdPJmG4lo6rwGDcFRQqcs0em9G9WerQYBX
// SIG // Drw4nwK7fg1AVckAYuQd5T4Uy8xghECulBomp/gUcCQs
// SIG // P5Xvxqing6mVLb+LgkElvbSU1gzUDCCOt+RXoMMA/XYf
// SIG // 3jL4caTAUtLgpVrXdW4KaHEqMJcnF+vyc++OeRCEncxB
// SIG // mifQZSAxGC5fuHNmYZNJGMi+gN87kOqddBKTPw2VczG3
// SIG // zLPuMpR2LwNKBD30UIRTTCNFR/nBn3J0u/IqwkO7yScS
// SIG // WhePOn4n9ezYbbnGDB8DD6nggLcuKs3V2TmULNKSvkfA
// SIG // 2v8LIsceuAYmn75Jee7LuDkKDhY32XKhifj3czwhDYcS
// SIG // oYICKDCCAiQGCSqGSIb3DQEJBjGCAhUwggIRAgEBMIGO
// SIG // MHcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xITAfBgNVBAMTGE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQQITMwAAAJgEWMt/
// SIG // IwmwngAAAAAAmDAJBgUrDgMCGgUAoF0wGAYJKoZIhvcN
// SIG // AQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcN
// SIG // MTYwNjIwMjIwNDQwWjAjBgkqhkiG9w0BCQQxFgQUNCpP
// SIG // e9dTn3/Pt8Di55gZtsv0srUwDQYJKoZIhvcNAQEFBQAE
// SIG // ggEAwX29SqjN9BbjJdM0UjsgrPv6EIDnRIsHN+MH0G9R
// SIG // lvACuXaq8zURfrmjW//jWs/6M8I+qJo5At1NxOq4wzCP
// SIG // T+zmz7k5hpUx+bRajdj/jDyxFvgxk7cuo2CDeVhXq94y
// SIG // 3HaDY8mluEf76UgzBZaekPxR3OSykjN04R5Ova6QRKL+
// SIG // W+FfygHRyHS4UafZllchr5+lsWeikPOtPwFopor6IuWL
// SIG // npPMrT7H2yxnGFLuIFfdvVf4KSSp8KJhzMpRi06YcBUD
// SIG // 7SNVYYAXSPrkwLJgOEEjWIg/tJqzp7SRxp9vBd1B1I+6
// SIG // I+OLjedpt5peZr7EMmfJEyRpyA4zyeAVDpOPgA==
// SIG // End signature block
