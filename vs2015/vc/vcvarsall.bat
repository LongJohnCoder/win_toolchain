

@echo off

REM VC command prompt depends on env. variable installed during VS. This causes VC command prompt to break for C++ Build SKU.
REM [1] If a VS 2015 IDE SKU is installed, the environment will be configured to use those bits.
REM [2] If VS 2015 C++ Build Tools are installed, we'll go to Build Tools SKU initialization.
REM [3] The "else" case is to fall-through to VS SKU initialization. This will happen if the VS 2017 C++ Toolset (v140) 
REM     is installed via VS 2017 (or later) optional feature selection.

if exist "%~dp0..\common7\IDE\devenv.exe" goto setup_VS
if exist "%~dp0..\common7\IDE\wdexpress.exe" goto setup_VS
if exist "%~dp0..\..\Microsoft Visual C++ Build Tools\vcbuildtools.bat" goto setup_buildsku

:setup_VS

if "%1" == "" goto x86
if "%2" == "" goto check_platform
setlocal
set _Argument2=%2
if not "%2"=="store" if not "%2"=="8.1" if not "%_Argument2:~0,3%"=="10."  goto usage
endlocal

:check_platform
if /i %1 == x86       goto x86
if /i %1 == amd64     goto amd64
if /i %1 == x64       goto amd64
if /i %1 == arm       goto arm
if /i %1 == x86_arm   goto x86_arm
if /i %1 == x86_amd64 goto x86_amd64
if /i %1 == amd64_x86 goto amd64_x86
if /i %1 == amd64_arm goto amd64_arm
goto usage

:x86
if not exist "%~dp0bin\vcvars32.bat" goto missing
call "%~dp0bin\vcvars32.bat" %2 %3
goto :SetVisualStudioVersion

:amd64
if not exist "%~dp0bin\amd64\vcvars64.bat" goto missing
call "%~dp0bin\amd64\vcvars64.bat" %2 %3
goto :SetVisualStudioVersion

:arm
if not exist "%~dp0bin\arm\vcvarsarm.bat" goto missing
call "%~dp0bin\arm\vcvarsarm.bat" %2 %3
goto :SetVisualStudioVersion

:x86_amd64
if not exist "%~dp0bin\x86_amd64\vcvarsx86_amd64.bat" goto missing
call "%~dp0bin\x86_amd64\vcvarsx86_amd64.bat" %2 %3
goto :SetVisualStudioVersion

:x86_arm
if not exist "%~dp0bin\x86_arm\vcvarsx86_arm.bat" goto missing
call "%~dp0bin\x86_arm\vcvarsx86_arm.bat" %2 %3
goto :SetVisualStudioVersion

:amd64_x86
if not exist "%~dp0bin\amd64_x86\vcvarsamd64_x86.bat" goto missing
call "%~dp0bin\amd64_x86\vcvarsamd64_x86.bat" %2 %3
goto :SetVisualStudioVersion

:amd64_arm
if not exist "%~dp0bin\amd64_arm\vcvarsamd64_arm.bat" goto missing
call "%~dp0bin\amd64_arm\vcvarsamd64_arm.bat" %2 %3
goto :SetVisualStudioVersion

:SetVisualStudioVersion
set VisualStudioVersion=14.0
goto :eof

:setup_buildsku
if not exist "%~dp0..\..\Microsoft Visual C++ Build Tools\vcbuildtools.bat" goto usage
set CurrentDir=%CD%
call "%~dp0..\..\Microsoft Visual C++ Build Tools\vcbuildtools.bat" %1 %2
cd /d %CurrentDir%
goto :eof

:usage
echo Error in script usage. The correct usage is:
echo     %0 [option]
echo   or
echo     %0 [option] store
echo   or
echo     %0 [option] [version number]
echo   or
echo     %0 [option] store [version number]
echo where [option] is: x86 ^| amd64 ^| arm ^| x86_amd64 ^| x86_arm ^| amd64_x86 ^| amd64_arm
echo where [version number] is either the full Windows 10 SDK version number or "8.1" to use the windows 8.1 SDK
echo :
echo The store parameter sets environment variables to support
echo   store (rather than desktop) development.
echo :
echo For example:
echo     %0 x86_amd64
echo     %0 x86_arm store
echo     %0 x86_amd64 10.0.10240.0
echo     %0 x86_arm store 10.0.10240.0
echo     %0 x64 8.1
echo     %0 x64 store 8.1
echo :
echo Please make sure either Visual Studio or C++ Build SKU is installed.
goto :eof

:missing
echo The specified configuration type is missing.  The tools for the
echo configuration might not be installed.
goto :eof

