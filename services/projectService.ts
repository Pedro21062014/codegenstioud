import { ProjectFile, AppType } from '../types';

declare const JSZip: any;

export const createProjectZip = async (files: ProjectFile[]): Promise<Blob> => {
  if (typeof JSZip === 'undefined') {
    throw new Error('A biblioteca JSZip não foi carregada.');
  }
  
  const zip = new JSZip();

  files.forEach(file => {
    zip.file(file.name, file.content);
  });

  return zip.generateAsync({ type: 'blob' });
};


export const getProjectSize = async (files: ProjectFile[]): Promise<number> => {
  try {
    const zipBlob = await createProjectZip(files);
    return zipBlob.size;
  } catch (error) {
    console.error("Error calculating project size:", error);
    return 0;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const downloadProjectAsZip = async (files: ProjectFile[], projectName: string = 'ai-codegen-project') => {
  try {
    const zipBlob = await createProjectZip(files);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error creating zip file:", error);
    const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao criar o arquivo zip.";
    alert(message);
  }
};

export const createDesktopAppFiles = async (files: ProjectFile[], appType: AppType, projectName: string): Promise<ProjectFile[]> => {
  const desktopFiles: ProjectFile[] = [];

  // Create C# WPF Application
  const programCsFile: ProjectFile = {
    name: 'Program.cs',
    language: 'csharp',
    content: `using System;
using System.Windows;

namespace ${projectName.replace(" ", "")}
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            
            // Create and show main window
            MainWindow mainWindow = new MainWindow();
            mainWindow.Show();
        }
    }
}`
  };

  const mainWindowCsFile: ProjectFile = {
    name: 'MainWindow.xaml.cs',
    language: 'csharp',
    content: `using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace ${projectName.replace(" ", "")}
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            Title = "${projectName}";
            Width = 800;
            Height = 600;
            MinWidth = 400;
            MinHeight = 300;
            WindowStartupLocation = WindowStartupLocation.CenterScreen;
        }
        
        private void ExitButton_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }
        
        private void MinimizeButton_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }
    }
}`
  };

  const mainWindowXamlFile: ProjectFile = {
    name: 'MainWindow.xaml',
    language: 'xml',
    content: `<Window x:Class="${projectName.replace(" ", "")}.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="${projectName}" Height="600" Width="800">
    <Grid Background="#2D3748">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
        </Grid.RowDefinitions>
        
        <!-- Title Bar -->
        <Border Grid.Row="0" Background="#1A202C" Padding="15,10">
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                
                <TextBlock Grid.Column="0" Text="${projectName}" 
                          Foreground="White" FontSize="16" FontWeight="Bold" 
                          VerticalAlignment="Center"/>
                
                <StackPanel Grid.Column="1" Orientation="Horizontal">
                    <Button Name="MinimizeButton" Content="−" Width="30" Height="25" 
                           Background="Transparent" Foreground="White" BorderThickness="0"
                           Click="MinimizeButton_Click" Margin="0,0,5,0"/>
                    <Button Name="ExitButton" Content="✕" Width="30" Height="25" 
                           Background="Transparent" Foreground="White" BorderThickness="0"
                           Click="ExitButton_Click"/>
                </StackPanel>
            </Grid>
        </Border>
        
        <!-- Main Content -->
        <Border Grid.Row="1" Padding="20" Background="#2D3748">
            <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
                <TextBlock Text="Bem-vindo ao ${projectName}!" 
                          Foreground="White" FontSize="24" FontWeight="Bold" 
                          HorizontalAlignment="Center" Margin="0,0,0,20"/>
                <TextBlock Text="Seu aplicativo desktop foi criado com sucesso." 
                          Foreground="#A0AEC0" FontSize="16" 
                          HorizontalAlignment="Center" TextWrapping="Wrap"/>
            </StackPanel>
        </Border>
    </Grid>
</Window>`
  };

  const appXamlFile: ProjectFile = {
    name: 'App.xaml',
    language: 'xml',
    content: `<Application x:Class="${projectName.replace(" ", "")}.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Application.Resources>
        <!-- Estilos globais podem ser definidos aqui -->
    </Application.Resources>
</Application>`
  };

  const projectFile: ProjectFile = {
    name: `${projectName.replace(" ", "")}.csproj`,
    language: 'xml',
    content: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net6.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <UseWPF>true</UseWPF>
    <AssemblyTitle>${projectName}</AssemblyTitle>
    <AssemblyDescription>Aplicativo desktop criado com Codegen Studio</AssemblyDescription>
    <AssemblyVersion>1.0.0.0</AssemblyVersion>
    <FileVersion>1.0.0.0</FileVersion>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Hosting" Version="7.0.0" />
  </ItemGroup>

</Project>`
  };

  // Add README with C# instructions
  const readmeFile: ProjectFile = {
    name: 'README.md',
    language: 'markdown',
    content: `# ${projectName}

## Como executar este aplicativo desktop C#

### Pré-requisitos
- .NET 6.0 ou superior instalado
- Visual Studio 2022 ou Visual Studio Code

### Compilação e Execução

#### Usando Visual Studio
1. Abra o arquivo \`${projectName.replace(" ", "")}.csproj\` no Visual Studio
2. Pressione F5 ou clique em "Iniciar Depuração"
3. O aplicativo será compilado e executado

#### Usando Linha de Comando
1. Abra o terminal na pasta do projeto
2. Execute o comando:
   \`\`\`bash
   dotnet build
   \`\`\`
3. Para executar o aplicativo:
   \`\`\`bash
   dotnet run
   \`\`\`

#### Criando o Executable (.exe)
1. Compile em modo Release:
   \`\`\`bash
   dotnet build -c Release
   \`\`\`
2. O executável será gerado em:
   \`bin\\Release\\net6.0-windows\\${projectName.replace(" ", "")}.exe\`

### Distribuição
Para criar um instalador completo, você pode usar:
- **Microsoft Installer**: \`dotnet publish -c Release -r win-x64 --self-contained\`
- **ClickOnce**: Configuração através do Visual Studio
- **Terceiros**: Inno Setup, WiX Toolset, etc.

### Estrutura do Projeto
- \`Program.cs\` - Ponto de entrada da aplicação
- \`MainWindow.xaml\` - Interface da janela principal
- \`MainWindow.xaml.cs\` - Code-behind da janela principal
- \`App.xaml\` - Recursos globais da aplicação
- \`${projectName.replace(" ", "")}.csproj\` - Configuração do projeto .NET

O aplicativo utiliza WPF (Windows Presentation Foundation) para criar uma interface nativa do Windows.
`
  };

  desktopFiles.push(programCsFile, mainWindowCsFile, mainWindowXamlFile, appXamlFile, projectFile, readmeFile);

  return desktopFiles;
};

export const createDesktopExe = async (files: ProjectFile[], projectName: string): Promise<void> => {
  try {
    const desktopFiles = await createDesktopAppFiles(files, 'desktop', projectName);
    
    // Create a simple batch file to compile the C# project
    const batchFile: ProjectFile = {
      name: 'build.bat',
      language: 'batch',
      content: `@echo off
echo Compilando aplicativo C#...
dotnet build -c Release

if exist "bin\\Release\\net6.0-windows\\${projectName.replace(" ", "")}.exe" (
    echo.
    echo SUCESSO! Executavel criado em:
    echo bin\\Release\\net6.0-windows\\${projectName.replace(" ", "")}.exe
    echo.
    echo Pressione qualquer tecla para executar o aplicativo...
    pause > nul
    start "" "bin\\Release\\net6.0-windows\\${projectName.replace(" ", "")}.exe"
) else (
    echo.
    echo ERRO: Nao foi possivel criar o executavel.
    echo Verifique se o .NET 6.0 esta instalado.
    pause
)`
    };
    
    desktopFiles.push(batchFile);
    
    // Download all files including the batch file
    await downloadProjectAsZip(desktopFiles, `${projectName}-desktop`);
    
    alert(`Projeto C# desktop baixado! Para criar o .exe:\n\n1. Descompacte o arquivo\n2. Execute build.bat\n3. O .exe será criado automaticamente`);
    
  } catch (error) {
    console.error("Error creating desktop exe:", error);
    const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao criar o executável desktop.";
    alert(message);
  }
};

export const downloadDesktopApp = async (files: ProjectFile[], projectName: string) => {
  try {
    const desktopFiles = await createDesktopAppFiles(files, 'desktop', projectName);
    await downloadProjectAsZip(desktopFiles, `${projectName}-desktop`);
  } catch (error) {
    console.error("Error creating desktop app:", error);
    const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao criar o aplicativo desktop.";
    alert(message);
  }
};
